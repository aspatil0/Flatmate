export interface PasswordStrength {
    isValid: boolean;
    score: number;
    errors: string[];
    suggestions: string[];
}
export declare const validatePasswordStrength: (password: string) => PasswordStrength;
export declare const getPasswordStrengthLabel: (score: number) => string;
//# sourceMappingURL=passwordValidator.d.ts.map