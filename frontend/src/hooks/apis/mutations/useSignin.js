import { useMutation } from "@tanstack/react-query";
import { signinApi } from "../../../apis/auth.js";
import { useAuthStore } from "../../../store/authStore.js";

export const useSignin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const { mutateAsync, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: signinApi,
    onSuccess: (data) => {
      if (data?.data?.user && data?.data?.token) {
        setAuth(data.data.user, data.data.token);
      }
    },
  });

  return {
    signinMutation: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
  };
};
