import { toast as rtToast } from "react-toastify";

const variantToType = {
  destructive: "error",
  error: "error",
  success: "success",
  info: "info",
  warning: "warning",
};

function toast({ title, description, variant } = {}) {
  const type = variantToType[variant] || "info";

  // Build the visible message. If both title and description are given,
  const msg = description ? (
    <div>
      {title && <div style={{ fontWeight: 600, marginBottom: 2 }}>{title}</div>}
      <div style={{ fontSize: 13, opacity: 0.9 }}>{description}</div>
    </div>
  ) : (
    title || ""
  );

  rtToast[type](msg, { autoClose: 4000 });
}

function useToast() {
  return {
    toast,
    dismiss: () => rtToast.dismiss(),
  };
}

export { useToast, toast };
