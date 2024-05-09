import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../services/user";

export function useUsers() {
  const { isLoading, data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  return { isLoading, users };
}
