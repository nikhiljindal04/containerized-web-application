import { useMutation } from "@tanstack/react-query";
import { signupApi } from "../../../apis/auth.js";
import { useAuthStore } from "../../../store/authStore.js";

export const useSignup = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const { mutateAsync, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: signupApi,
    onSuccess: (data) => {
      if (data?.data?.user && data?.data?.token) {
        setAuth(data.data.user, data.data.token);
      }
    },
  });

  return {
    signupMutation: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
  };
};
