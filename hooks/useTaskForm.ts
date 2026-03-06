import { useState, useCallback } from "react";
import { TaskPriority } from "@/types/task";

type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: string;
  dueDate: string;
  tags: string[];
  assignedTo: string;
};

type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

interface UseTaskFormReturn {
  values: TaskFormValues;
  errors: TaskFormErrors;
  handleChange: <K extends keyof TaskFormValues>(field: K, value: TaskFormValues[K]) => void;
  handleSubmit: (onSubmit: (values: TaskFormValues) => void) => void;
  reset: () => void;
}

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  dueDate: "",
  tags: [],
  assignedTo: "",
};

export function useTaskForm(initialValues?: Partial<TaskFormValues>): UseTaskFormReturn {
  const [values, setValues] = useState<TaskFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  const [errors, setErrors] = useState<TaskFormErrors>({});

  const handleChange = useCallback(
    <K extends keyof TaskFormValues>(field: K, value: TaskFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const newErrors: TaskFormErrors = {};

    if (!values.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!values.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else if (isNaN(new Date(values.dueDate).getTime())) {
      newErrors.dueDate = "Please enter a valid date";
    }

    if (!values.assignedTo.trim()) {
      newErrors.assignedTo = "Please assign this task to someone";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const handleSubmit = useCallback(
    (onSubmit: (values: TaskFormValues) => void) => {
      if (validate()) {
        onSubmit(values);
      }
    },
    [validate, values],
  );

  const reset = useCallback(() => {
    setValues({ ...defaultValues, ...initialValues });
    setErrors({});
  }, [initialValues]);

  return { values, errors, handleChange, handleSubmit, reset };
}