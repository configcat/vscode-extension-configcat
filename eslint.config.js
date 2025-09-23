// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const stylistic = require("@stylistic/eslint-plugin");
const importPlugin = require("eslint-plugin-import");
const angular = require("angular-eslint");
const rxjs = require("@smarttools/eslint-plugin-rxjs");
const sonarjs = require("eslint-plugin-sonarjs");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    plugins: { "@stylistic": stylistic, rxjs },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
      rxjs.configs.recommended,
      sonarjs.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: { parserOptions: { projectService: true } },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      /* @eslint/js suggestions (https://eslint.org/docs/latest/rules/#suggestions) */
      eqeqeq: ["error", "always", { null: "ignore" }],
      "grouped-accessor-pairs": "error",
      "no-case-declarations": "off",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-undef-init": "error",
      "no-undefined": "error",

      /* typescript-eslint rules (https://typescript-eslint.io/rules/#supported-rules) */
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-extraneous-class": "off", //TODO - do it
      "@typescript-eslint/no-non-null-assertion": "off", // Sometimes we just know it.
      // This rule would be useful but produces too many false positives when `noUncheckedIndexedAccess`
      // is disabled. However, enabling that would cause a lot of other false positives.
      // So we turn this lint rule off until `noUncheckedIndexedAccess` is improved.
      // See also: https://github.com/typescript-eslint/typescript-eslint/issues/6264
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/restrict-plus-operands": ["error", { allowNumberAndString: true }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
      "@typescript-eslint/prefer-nullish-coalescing": "off", // TODO do it later
      "@typescript-eslint/no-misused-spread": "off", // TODO check later if we need it.

      /* @smarttools/eslint-plugin-rxjs rules (https://github.com/DaveMBush/eslint-plugin-rxjs?tab=readme-ov-file#rules) */
      "@smarttools/rxjs/no-implicit-any-catch": "off",
      "@smarttools/rxjs/no-nested-subscribe": "off",

      /* eslint-plugin-sonarjs rules (https://sonarsource.github.io/rspec/#/rspec/) */
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/function-return-type": "off",
      "sonarjs/max-switch-cases": "off",
      "sonarjs/no-labels": "off",
      "sonarjs/no-redundant-jump": "off",
      "sonarjs/no-selector-parameter": "off",
      "sonarjs/no-misleading-array-reverse": "off",
      "sonarjs/no-nested-assignment": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-nested-functions": "off",
      "sonarjs/prefer-single-boolean-return": "off",
      "sonarjs/regex-complexity": "off",
      "sonarjs/slow-regex": "off",
      "sonarjs/updated-loop-counter": "off",

      /* angular-eslint rules (https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/README.md#rules) */
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: ["configcat-trello"], style: "kebab-case" },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: ["configcat-trello"], style: "camelCase" },
      ],
      "@angular-eslint/no-async-lifecycle-method": "error",
      "@angular-eslint/no-conflicting-lifecycle": "error",
      "@angular-eslint/no-duplicates-in-metadata-arrays": "error",
      "@angular-eslint/prefer-output-readonly": "error",
      "@angular-eslint/prefer-signals": "error",
      "@angular-eslint/relative-url-prefix": "error",
      "@angular-eslint/use-component-selector": "error",
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/no-uncalled-signals": "error",
      "@angular-eslint/prefer-output-emitter-ref": "error",
      // All rules for angular eslint-plugin: https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/src/configs/all.json

      /* Layout & Formatting (https://eslint.style/packages/js, https://eslint.style/packages/ts) */
      // NOTE: When a rule has both TS and JS version, use the TS one!
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/arrow-spacing": ["error", { before: true, after: true }],
      "@stylistic/block-spacing": ["error", "always"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "never",
          importAttributes: "always-multiline",
          dynamicImports: "never",
          enums: "always-multiline",
          generics: "never",
          tuples: "always-multiline",
        },
      ],
      "@stylistic/comma-spacing": ["error", { after: true }],
      "@stylistic/computed-property-spacing": ["error", "never"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/func-call-spacing": ["error", "never"],
      "@stylistic/generator-star-spacing": [
        "error",
        { before: false, after: true, method: { before: true, after: false } },
      ],
      "@stylistic/indent": [
        "error",
        2,
        {
          SwitchCase: 1,
          flatTernaryExpressions: true,
          offsetTernaryExpressions: true,
          ignoredNodes: [
            // https://github.com/typescript-eslint/typescript-eslint/issues/1824#issuecomment-1378327382
            "TSUnionType",
          ],
        },
      ],
      "@stylistic/key-spacing": ["error", { beforeColon: false, afterColon: true, mode: "strict" }],
      "@stylistic/keyword-spacing": ["error", { before: true, after: true }],
      "@stylistic/max-len": [
        "error",
        { code: 160, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true },
      ],
      "@stylistic/member-delimiter-style": "error",
      "@stylistic/new-parens": "error",
      "@stylistic/no-extra-semi": "error",
      "@stylistic/no-multi-spaces": "error",
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0 }],
      "@stylistic/no-tabs": "error",
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/no-whitespace-before-property": "error",
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/operator-linebreak": [
        "error",
        "after",
        {
          overrides: {
            "**": "before",
            "*": "before",
            "/": "before",
            "%": "before",
            "+": "before",
            "-": "before",
            "<<": "before",
            ">>": "before",
            ">>>": "before",
            "&&": "before",
            "||": "before",
            "??": "before",
            "&": "before",
            "|": "before",
            "^": "before",
            "?": "before",
            ":": "before",
          },
        },
      ],
      "@stylistic/quote-props": ["error", "consistent"],
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
      "@stylistic/rest-spread-spacing": ["error", "never"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/semi-spacing": ["error", { before: false, after: true }],
      "@stylistic/semi-style": "error",
      "@stylistic/space-before-blocks": ["error", "always"],
      "@stylistic/space-before-function-paren": ["error", { anonymous: "never", named: "never", asyncArrow: "always" }],
      "@stylistic/space-in-parens": ["error", "never"],
      "@stylistic/space-infix-ops": "error",
      "@stylistic/space-unary-ops": ["error", { words: true, nonwords: false }],
      "@stylistic/switch-colon-spacing": ["error", { before: false, after: true }],
      "@stylistic/template-curly-spacing": ["error", "never"],
      "@stylistic/template-tag-spacing": ["error", "never"],
      "@stylistic/type-annotation-spacing": "error",
      "@stylistic/yield-star-spacing": ["error", "after"],

      /* Naming conventions (https://typescript-eslint.io/rules/naming-convention/) */
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "variable", format: ["camelCase", "UPPER_CASE"] },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow", // for indicating unused parameters
        },
        { selector: "variableLike", format: ["camelCase"] },
        { selector: "enumMember", format: ["PascalCase"] },
        { selector: ["objectLiteralProperty", "typeProperty"], format: null },
        {
          selector: ["objectLiteralMethod", "objectLiteralProperty", "typeMethod", "typeProperty"],
          modifiers: ["requiresQuotes"],
          format: null,
        },
        {
          selector: ["classProperty"],
          format: [
            "camelCase",
            "PascalCase", // sometimes it's necessary to expose types to Angular templates
            "UPPER_CASE",
          ],
          leadingUnderscore: "allow", // for indicating private properties
        },
        { selector: "memberLike", format: ["camelCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
      ],

      /* Import declarations (https://github.com/import-js/eslint-plugin-import) */
      "import/order": [
        "error",
        {
          groups: [["builtin", "external"], "internal", "parent", "sibling", "index", "unknown"],
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/newline-after-import": "error",
      "import/no-unresolved": "off",
      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: true,
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      eslintPluginPrettierRecommended,
    ],
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
      "@angular-eslint/template/no-autofocus": "off",
      "@angular-eslint/template/prefer-control-flow": "error",
      "@angular-eslint/template/use-track-by-function": "error",
      "@angular-eslint/template/banana-in-box": "error",
      "@angular-eslint/template/eqeqeq": "error",
      "@angular-eslint/template/no-any": "error",
      "@angular-eslint/template/no-distracting-elements": "error",
      "@angular-eslint/template/no-duplicate-attributes": "error",
      "@angular-eslint/template/no-interpolation-in-attributes": "error",
      "@angular-eslint/template/attributes-order": "error",
      "@angular-eslint/template/button-has-type": "error",
      "@angular-eslint/template/prefer-self-closing-tags": "error",
      "@angular-eslint/template/prefer-at-empty": "error",
      "@angular-eslint/template/no-nested-tags": "error",
      "@angular-eslint/template/prefer-static-string-properties": "error",
      // All rules for angular eslint-plugin-template: https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/src/configs/all.json
    },
  }
);
