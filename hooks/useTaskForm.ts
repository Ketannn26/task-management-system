// hooks/useTaskForm.ts
import { useState, useCallback } from "react";
import { TaskPriority, TaskStatus } from "@/types/task";

// The shape of our form values
// We use Partial<Task> because not all fields are filled immediately
type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
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
  // Merge default values with any initial values passed in
  const [values, setValues] = useState<TaskFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  const [errors, setErrors] = useState<TaskFormErrors>({});

  // ── Update a single field ─────────────────────────────────
  const handleChange = useCallback(
    <K extends keyof TaskFormValues>(field: K, value: TaskFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear the error for this field when user starts typing
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  // ── Validate the form ─────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: TaskFormErrors = {};

    // Title is required
    if (!values.title.trim()) {
      newErrors.title = "Title is required";
    }

    // Due date is required and must be valid
    if (!values.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else if (isNaN(new Date(values.dueDate).getTime())) {
      newErrors.dueDate = "Please enter a valid date";
    }

    // Assigned to is required
    if (!values.assignedTo.trim()) {
      newErrors.assignedTo = "Please assign this task to someone";
    }

    setErrors(newErrors);

    // Return true if no errors (form is valid)
    return Object.keys(newErrors).length === 0;
  }, [values]);

  // ── Handle form submission ────────────────────────────────
  const handleSubmit = useCallback(
    (onSubmit: (values: TaskFormValues) => void) => {
      // Only call onSubmit if validation passes
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
