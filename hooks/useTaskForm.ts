// hooks/useTaskForm.ts
import { useState, useCallback } from "react";
import { TaskPriority } from "@/types/task"; // ← remove TaskStatus import

// The shape of our form values
type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: string; // ← was TaskStatus, now plain string
  dueDate: string;
  tags: string[];
  assignedTo: string;
};

// Validation errors — each field can have an error message or undefined
type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

interface UseTaskFormReturn {
  values: TaskFormValues;
  errors: TaskFormErrors;
  handleChange: <K extends keyof TaskFormValues>(
    field: K,
    value: TaskFormValues[K],
  ) => void;
  handleSubmit: (onSubmit: (values: TaskFormValues) => void) => void;
  reset: () => void;
}

// Default empty form values
const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  dueDate: "",
  tags: [],
  assignedTo: "",
};

export function useTaskForm(
  initialValues?: Partial<TaskFormValues>,
): UseTaskFormReturn {
  const [values, setValues] = useState<TaskFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  const [errors, setErrors] = useState<TaskFormErrors>({});

  // ── Update a single field ─────────────────────────────────
  const handleChange = useCallback(
    <K extends keyof TaskFormValues>(field: K, value: TaskFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  // ── Validate the form ─────────────────────────────────────
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

  // ── Handle form submission ────────────────────────────────
  const handleSubmit = useCallback(
    (onSubmit: (values: TaskFormValues) => void) => {
      if (validate()) {
        onSubmit(values);
      }
    },
    [validate, values],
  );

  // ── Reset form to initial values ──────────────────────────
  const reset = useCallback(() => {
    setValues({ ...defaultValues, ...initialValues });
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    reset,
  };
}