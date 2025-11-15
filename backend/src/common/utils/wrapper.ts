import { catchOrThrow } from "../error";

// Service decorator wrapper
export function service(
  _: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const spanName = `${this.constructor.name}.${propertyKey}`;
    return catchOrThrow(() => original.apply(this, args), {
      spanName,
      args: args,
    });
  };

  return descriptor;
}
