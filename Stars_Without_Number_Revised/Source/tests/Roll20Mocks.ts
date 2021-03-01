const myCrypto = require("crypto");
const translation = require('../../translation.json')


const state = {
    repeating_weapons: {
        hdjsadksajkl: {
            weapon_ab: {
                value: 5,
                listeners: {
                    change: []
                }
            }
        }
    },
    AC: {value: 25, listeners: {change: []}}
}

const getAttrs = (attributes, callback) => {
    callback(attributes.map(a => {
        if (state[a]) return state[a]
        const [section, id, field] = a.split("-")
        return state[section.substring(0, section.length - 1)][id][field.substr(1)].value
    }))
}

const setAttrs = (values, options, callback) => {
    Object.keys(values).forEach(v => {
        if (state[v]) Object.assign(state, {v: values[v]})
        const [section, id, field] = v.split("-")
        state[section.substring(0, section.length - 1)][id][field.substr(1)].listeners.change.forEach(f => f({
            sourceType: "sheetworker",
            sourceAttribute: v,
            previousValue: state[section.substring(0, section.length - 1)][id][field.substr(1)].value,
            newValue: values[v]
        }))
        Object.assign(state,{[section.substring(0, -1)]: {[id]: {[field.substr(1)]: {value: values[v]}}}})
    })
    callback(values)
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
    callback(Object.keys(state["repeating_" + section_name]))
}

const generateRowID = () => {
    return myCrypto.randomBytes(10).toString('hex');
}

const getTranslationByKey = (key) => {
    return translation[key]
}

const getTranslationLanguage = () => "en"

module.exports = {
    getAttrs,
    setAttrs,
    getSectionIDs,
    generateRowID,
    getTranslationByKey,
    getTranslationLanguage,
    on
}