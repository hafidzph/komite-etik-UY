import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateFormSurat as updateFormSuratApi } from "../../../services/documents";

export function useUpdateFormSurat(onClose) {
  const queryClient = useQueryClient();

  const { mutate: updateFormSurat, isPending } = useMutation({
    mutationFn: updateFormSuratApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries("documents_user");
      await queryClient.invalidateQueries("documents");
      toast.success("Form surat berhasil diupdate!");
      onClose();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { updateFormSurat, isPending };
}
