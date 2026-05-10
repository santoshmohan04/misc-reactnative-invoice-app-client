import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';

type UseZodFormProps<T extends FieldValues> = Omit<UseFormProps<T>, 'resolver'> & {
  schema: ZodType<T>;
};

export function useZodForm<T extends FieldValues>({ schema, ...formProps }: UseZodFormProps<T>) {
  return useForm<T>({
    ...formProps,
    resolver: zodResolver(schema as any) as any,
  });
}

export default useZodForm;
