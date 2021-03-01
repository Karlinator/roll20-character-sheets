const myCrypto = require("crypto");
const translation = require('../../translation.json')


let state = {}

const _setState = (newState) => {
    state = Object.assign({}, newState)
}

const _getState = () => state

const getAttrs = (attributes, callback) => {
    callback(attributes.reduce((obj, a) => {
        if (state[a]) return {...obj, [a]: state[a].value}
        const [section, rest] = a.split("-")
        const [id, field] = rest.split(/_(.+)/)
        return {...obj, [a]: state[section.slice(0, -1)]["value"][id][field]}
    }, {}))
}

const setAttrs = (values, options={silent: false}, callback) => {
    Object.keys(values).forEach(v => {
        if (state[v]) {
            const eventInfo = {
                sourceType: "sheetworker",
                sourceAttribute: v,
                previousValue: state[v].value,
                newValue: values[v]
            }
            !options.silent && state[v].listeners.change.forEach(f => f(eventInfo))
            state[v] = state[v] || {value: null, listeners: {change: []}}
            state[v].value = values[v]
            // Object.assign(state, {[v]: {value: values[v]}})
        } else {
            const [section, rest] = v.split("-")
            const [id, field] = rest.split(/_(.+)/)
            const eventInfo = {
                sourceType: "sheetworker",
                sourceAttribute: v,
                previousValue: state[section.slice(0, -1)].value[id][field],
                newValue: values[v]
            }
            !options.silent && state[section.slice(0, -1)].listeners.change.forEach(f => f(eventInfo))
            state[section.slice(0, -1)] = state[section.slice(0, -1)] || {value: {}, listeners: {}}
            state[section.slice(0, -1)].value[id] = state[section.slice(0, -1)].value[id] || {}
            state[section.slice(0, -1)].value[id][field] = values[v]
            // Object.assign(state,{[section.slice(0, -1)]: {value: {[id]: {[field]: values[v]}}}})
        }
    })
    callback(values)
}

const removeRepeatingRow = RowID => {
    const [, section, row] = RowID.split("_")
    const eventInfo = {
        removedInfo: state["repeating_" + section].value[row.replace("-", "")]
    }
    state["repeating_" + section].listeners.remove.forEach(f => f(eventInfo))
    delete state["repeating_" + section].value[row.replace("-", "")]
}

const on = (eventsString, handler) => {
    const events = eventsString.split(" ")
    events.forEach(e => {
        const [type, field] = e.split(":")
        if (state[field]) {
            state[field].listeners = {
                ...state[field].listeners,
                [type]: [...state[field].listeners[type], handler]
            }
        }
    })
}

const getSectionIDs = (section_name, callback) => {
    callback(Object.keys(state["repeating_" + section_name].value).map(v => "-" + v))
}

const generateRowID = () => {
    return myCrypto.randomBytes(10).toString('hex');
}

const getTranslationByKey = (key) => {
    return translation[key]
}

const getTranslationLanguage = () => "en"

module.exports = {
    _setState,
    _getState,
    getAttrs,
    setAttrs,
    removeRepeatingRow,
    getSectionIDs,
    generateRowID,
    getTranslationByKey,
    getTranslationLanguage,
    on,
}