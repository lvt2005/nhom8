import { reactive } from 'vue';

export function useForm(initialState = {}) {
  const form = reactive({ ...initialState });

  const resetForm = () => {
    Object.keys(form).forEach((key) => {
      form[key] = initialState[key];
    });
  };

  return {
    form,
    resetForm,
  };
}
