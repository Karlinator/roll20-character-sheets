const {_getState, _setState, getAttrs, setAttrs, getSectionIDs, removeRepeatingRow, getTranslationByKey, on} = require("./Roll20Mocks");

test("Test getAttr", () => {
    // Setup test state
    _setState({
        strength: {value: 10, listeners: {change: []}},
        constitution: {value: 18, listeners: {change: []}}
    })
    getAttrs(["strength", "constitution"], v => {
        expect(v.strength).toBe(10)
        expect(v.constitution).toBe(18)
    })
})

test("Test setAttr", () => {
    // Setup test state
    _setState({
        strength: {value: 10, listeners: {change: []}},
        constitution: {value: 18, listeners: {change: []}}
    })
    setAttrs({strength: 20}, {}, v => {
        expect(v.strength).toBe(20)
        expect(_getState().strength.value).toBe(20)
    })
})

test("Test getSectionIDs", () => {
    // Setup test state
    _setState({
        repeating_weapons: {
            value: {
                hdjsadajkl: {
                    weapon_ab: 5
                },
                jigfsonvnasd: {
                    weapon_ab: 5
                }
            }
        },
    })
    getSectionIDs("weapons", names => {
        expect(names.sort()).toEqual(["-hdjsadajkl", "-jigfsonvnasd"].sort())
    })
})

test("Test getTranslationByKey", () => {
    // This requires a correctly working imported translation.json file in the mocks.
    // It's not a very useful test
    expect(getTranslationByKey("GRAPNEL_LAUNCHER")).toBe("Grapnel launcher")
})

test("Test on", () => {
    const doTheThing = jest.fn()
    _setState({
        strength: {value: 10, listeners: {change: [doTheThing]}},
        constitution: {value: 18, listeners: {change: []}}
    })
    setAttrs({strength: 18}, {}, () => {
        expect(doTheThing).toHaveBeenCalledWith({previousValue: 10, newValue: 18, sourceAttribute: "strength", sourceType: "sheetworker"})
    })
    on("change:constitution", doTheThing)
    setAttrs({constitution: 10}, {}, () => {
        expect(doTheThing).toHaveBeenCalledWith({previousValue: 18, newValue: 10, sourceAttribute: "constitution", sourceType: "sheetworker"})
    })
})

test("Test repeating sections", () => {
    const changeListener = jest.fn()
    const removeListener = jest.fn()
    _setState({
        repeating_weapons: {
            value: {
                jdhksajdasjdkasl: {
                    weapon_ab: 5,
                    weapon_name: "Laser Rifle"
                },
                jfkalsdjohubdfi: {
                    weapon_ab: 2,
                    weapon_name: "Spike Thrower"
                }
            },
            listeners: {
                change: [changeListener],
                remove: [removeListener]
            }

        },
        encumbrance: {
            value: 8,
            listeners: {
                change: []
            }
        }
    })
    getSectionIDs("weapons", ids => {
        const attrs = [
            ...ids.map(id => `repeating_weapons_${id}_weapon_ab`),
            ...ids.map(id => `repeating_weapons_${id}_weapon_name`),

        ]
        const setting = {
            ...ids.reduce((obj, id) => ({...obj, [`repeating_weapons_${id}_weapon_ab`]: 20}), {})
        }
        getAttrs(attrs, v => {
            expect(v["repeating_weapons_-jdhksajdasjdkasl_weapon_ab"]).toBe(5)
        })
        setAttrs(setting, {}, () => {
            expect(changeListener).toBeCalled()
            expect(_getState().repeating_weapons.value.jdhksajdasjdkasl.weapon_ab).toBe(20)
            removeRepeatingRow("repeating_weapons_-jdhksajdasjdkasl")
            expect(removeListener).toHaveBeenCalledWith({
                removedInfo: {
                    weapon_ab: 20,
                    weapon_name: "Laser Rifle"
                }
            })
            expect(_getState().repeating_weapons.value.jdhksajdasjdkasl).toBe(undefined)
        })

    })
})