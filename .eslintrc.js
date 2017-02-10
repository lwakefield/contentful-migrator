module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "plugins": ["jest"],
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": "2017",
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    "globals": {
        "afterAll": true,
        "afterEach": true,
        "beforeAll": true,
        "beforeEach": true,
        "describe": true,
        "expect": true,
        "it": true,
        "jasmine": true,
        "jest": true
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};
