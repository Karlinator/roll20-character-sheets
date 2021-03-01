const {getAttrs, setAttrs, getSectionIDs, generateRowID, getTranslationByKey, on} = require("./Roll20Mocks");

test("tests the test", () => {
    getAttrs(["repeating_weapons_-hdjsadksajkl-_weapon_ab"], v => console.log(v))

    setAttrs({"repeating_weapons_-hdjsadksajkl-_weapon_ab": 20}, {},v => console.log(v))

    getSectionIDs("weapons", v => console.log(v))

    console.log(generateRowID())

    console.log(getTranslationByKey("CP_GAIN"))

    on("change:AC", () => console.log("here"))
})