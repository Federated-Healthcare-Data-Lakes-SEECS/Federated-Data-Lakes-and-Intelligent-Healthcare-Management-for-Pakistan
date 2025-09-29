import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "jsx-quotes": ["error", "prefer-double"],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },  
  },
];

export default eslintConfig;
