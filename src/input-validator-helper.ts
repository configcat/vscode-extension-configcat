export function requiredValidator(value: string): string | null {
  if (value) {
    return null;
  }
  return "Field is required.";
}

export function lengthValidator(value: string): string | null {
  if (value.length < 255) {
    return null;
  }
  return " The field must be at max 255 characters long.";
}
