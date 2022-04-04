import { useQueryClient, useQuery, useMutation } from "react-query";
import axios from "axios";

export const withUserUpsert =
    (Component) =>
    ({ ...props }) => {
        const queryClient = useQueryClient();
        const { data, error, isError, isLoading, isSuccess, mutate, mutateAsync } = useMutation(
            "mutateUser",
            (quest) => axios.post("/api/user", quest),
            {
                onSuccess: () => {},
            }
        );
        const handleOnUpsert = async (user) => {
            return await mutateAsync(user);
        };
        return (
            <Component
                {...props}
                isLoading={isLoading}
                mutationError={error}
                onUpsert={(user) => handleOnUpsert(user)}
            />
        );
    };