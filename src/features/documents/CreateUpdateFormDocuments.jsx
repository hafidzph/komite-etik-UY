import { Button, TextField, ThemeProvider } from "@mui/material";
import * as Yup from "yup";

import Form from "../../components/Form";
import FormRowInput from "../../components/FormRowInput";
import { theme } from "../../utils/theme";
import { MuiFileInput } from "mui-file-input";
import { useFormik } from "formik";
import { IoMdClose } from "react-icons/io";
import { useCreateDocument } from "./useCreateDocument";
import { useUpdateDocument } from "./useUpdateDocument";
import HandleCreate from "../../components/HandleCreate";
import HandleUpdate from "../../components/HandleUpdate";
import { useUpdateFormSurat } from "./admin/useUpdateFormSurat";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

function CreateUpdateFormDocuments({ id, onClose }) {
  const { createDocument, isCreating } = useCreateDocument(onClose);
  const { updateDocument, isUpdating } = useUpdateDocument(onClose);
  const { updateFormSurat, isPending } = useUpdateFormSurat(onClose);
  const { role } = useContext(AuthContext);
  const isAdmin = role === "admin";

  const {
    handleSubmit,
    setFieldValue,
    handleChange,
    handleBlur,
    touched,
    errors,
    values,
  } = useFormik({
    initialValues: id
      ? isAdmin
        ? { formSurat: null }
        : {
            formSurat: null,
            suratPengantar: null,
            suratRekomendasi: null,
            fileProposal: null,
            protokolPenelitian: null,
            cv: null,
            penjelasanPersetujuan: null,
            kuesioner: null,
          }
      : {
          namaPenelitian: "",
          formSurat: null,
          suratPengantar: null,
          suratRekomendasi: null,
          fileProposal: null,
          protokolPenelitian: null,
          cv: null,
          penjelasanPersetujuan: null,
          kuesioner: null,
        },
    validationSchema: Yup.object().shape(
      id
        ? isAdmin
          ? {
              formSurat: Yup.mixed().required(
                "Form Surat Kelayakan wajib diisi"
              ),
            }
          : {
              formSurat: Yup.mixed().required(
                "Form Surat Kelayakan wajib diisi"
              ),
              suratPengantar: Yup.mixed().required(
                "Surat Pengantar wajib diisi"
              ),
              suratRekomendasi: Yup.mixed().required(
                "Surat Rekomendasi wajib diisi"
              ),
              fileProposal: Yup.mixed().required("File Proposal wajib diisi"),
              protokolPenelitian: Yup.mixed().required(
                "Protokol Penelitian wajib diisi"
              ),
              cv: Yup.mixed().required("CV wajib diisi"),
            }
        : {
            namaPenelitian: Yup.string().required(
              "Nama Penelitian wajib diisi"
            ),
            formSurat: Yup.mixed().required("Form Surat Kelayakan wajib diisi"),
            suratPengantar: Yup.mixed().required("Surat Pengantar wajib diisi"),
            suratRekomendasi: Yup.mixed().required(
              "Surat Rekomendasi wajib diisi"
            ),
            fileProposal: Yup.mixed().required("File Proposal wajib diisi"),
            protokolPenelitian: Yup.mixed().required(
              "Protokol Penelitian wajib diisi"
            ),
            cv: Yup.mixed().required("CV wajib diisi"),
          }
    ),
    onSubmit: (values, { resetForm, setSubmitting }) => {
      try {
        const formData = new FormData();

        if (isAdmin) {
          const fileName = `formSurat-${values.formSurat.name}`;
          formData.append("formSurat", values.formSurat, fileName);
          HandleUpdate("", "", "", () =>
            updateFormSurat({ formData, id }, { onSettled: () => resetForm() })
          );
        } else {
          id ? "" : formData.append("researchName", values.namaPenelitian);

          const fileFields = [
            "formSurat",
            "suratPengantar",
            "suratRekomendasi",
            "fileProposal",
            "protokolPenelitian",
            "cv",
            "penjelasanPersetujuan",
            "kuesioner",
          ];

          fileFields.forEach((field) => {
            if (values[field]) {
              const fileName = `${field}-${values[field].name}`;

              formData.append("documents", values[field], fileName);
            }
          });

          id
            ? HandleUpdate("", "", "", () =>
                updateDocument(
                  { formData, id },
                  { onSettled: () => resetForm() }
                )
              )
            : HandleCreate(() =>
                createDocument(formData, { onSettled: () => resetForm() })
              );
        }
      } catch (error) {
        console.error("Error in onSubmit:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Form type="modal" onSubmit={handleSubmit}>
      {id || isAdmin ? (
        ""
      ) : (
        <FormRowInput>
          <span className="font-medium text-sm">Nama Penelitian (*)</span>
          <TextField
            id="namaPenelitian"
            variant="outlined"
            placeholder="Masukkan nama penelitian"
            value={values.namaPenelitian}
            onChange={handleChange}
            onBlur={handleBlur}
            InputProps={{
              sx: {
                height: "2.8rem",
                fontSize: 14,
                "@media (max-width: 767.95px)": {
                  fontSize: 12,
                },
              },
            }}
            error={touched.namaPenelitian && Boolean(errors.namaPenelitian)}
          />
          <span className="text-red-500 text-sm font-medium">
            {touched.namaPenelitian && errors.namaPenelitian}
          </span>
        </FormRowInput>
      )}

      <FormRowInput>
        <span className="font-medium text-sm">
          Form Surat Kelayakan Komite Etik (*)
        </span>

        <MuiFileInput
          id="formSurat"
          clearIconButtonProps={{
            title: "Remove",
            children: <IoMdClose size={30} />,
          }}
          value={values.formSurat}
          placeholder="Masukkan Form Surat Kelayakan Komite Etik"
          onChange={(value) => setFieldValue("formSurat", value)}
          inputProps={{ accept: ".pdf" }}
          onBlur={handleBlur}
          InputProps={{
            sx: {
              height: "2.8rem",
              fontSize: 14,
              "@media (max-width: 767.95px)": {
                fontSize: 11,
              },
            },
          }}
          error={touched.formSurat && Boolean(errors.formSurat)}
        />
        <span className="text-red-500 text-sm font-medium">
          {touched.formSurat && errors.formSurat}
        </span>
      </FormRowInput>

      {isAdmin || (
        <>
          <FormRowInput>
            <span className="font-medium text-sm">
              Surat Pengantar dari Lembaga/Institusi/Ketua Peneliti (*)
            </span>

            <MuiFileInput
              id="suratPengantar"
              clearIconButtonProps={{
                title: "Remove",
                children: <IoMdClose size={30} />,
              }}
              value={values.suratPengantar}
              placeholder="Masukkan Surat Pengantar"
              onChange={(value) => setFieldValue("suratPengantar", value)}
              inputProps={{ accept: ".pdf" }}
              onBlur={handleBlur}
              InputProps={{
                sx: {
                  height: "2.8rem",
                  fontSize: 14,
                  "@media (max-width: 767.95px)": {
                    fontSize: 11,
                  },
                },
              }}
              error={touched.suratPengantar && Boolean(errors.suratPengantar)}
            />
            <span className="text-red-500 text-sm font-medium">
              {touched.suratPengantar && errors.suratPengantar}
            </span>
          </FormRowInput>
          <FormRowInput>
            <span className="font-medium text-sm">
              Surat Rekomendasi dari Kepala Unit/Kepala Pusat/Kepala Lembaga (*)
            </span>

            <MuiFileInput
              id="suratRekomendasi"
              value={values.suratRekomendasi}
              onChange={(value) => setFieldValue("suratRekomendasi", value)}
              placeholder="Masukkan Surat Rekomendasi"
              inputProps={{ accept: ".pdf" }}
              clearIconButtonProps={{
                title: "Remove",
                children: <IoMdClose size={30} />,
              }}
              onBlur={handleBlur}
              InputProps={{
                sx: {
                  height: "2.8rem",
                  fontSize: 14,
                  "@media (max-width: 767.95px)": {
                    fontSize: 11,
                  },
                },
              }}
              error={
                touched.suratRekomendasi && Boolean(errors.suratRekomendasi)
              }
            />
            <span className="text-red-500 text-sm font-medium">
              {touched.suratRekomendasi && errors.suratRekomendasi}
            </span>
          </FormRowInput>
          <FormRowInput>
            <span className="font-medium text-sm">
              File Proposal yang sudah disahkan oleh Institusi/Lembaga (*)
            </span>

            <MuiFileInput
              id="fileProposal"
              clearIconButtonProps={{
                title: "Remove",
                children: <IoMdClose size={30} />,
              }}
              value={values.fileProposal}
              placeholder="Masukkan File Proposal"
              onChange={(value) => setFieldValue("fileProposal", value)}
              inputProps={{ accept: ".pdf" }}
              onBlur={handleBlur}
              InputProps={{
                sx: {
                  height: "2.8rem",
                  fontSize: 14,
                  "@media (max-width: 767.95px)": {
                    fontSize: 11,
                  },
                },
              }}
              error={touched.fileProposal && Boolean(errors.fileProposal)}
            />
            <span className="text-red-500 text-sm font-medium">
              {touched.fileProposal && errors.fileProposal}
            </span>
          </FormRowInput>
          <FormRowInput>
            <span className="font-medium text-sm">Protokol Penelitian (*)</span>

            <MuiFileInput
              id="protokolPenelitian"
              clearIconButtonProps={{
                title: "Remove",
                children: <IoMdClose size={30} />,
              }}
              value={values.protokolPenelitian}
              placeholder="Masukkan File Protokol Penelitian"
              onChange={(value) => setFieldValue("protokolPenelitian", value)}
              inputProps={{ accept: ".pdf" }}
              onBlur={handleBlur}
              InputProps={{
                sx: {
                  height: "2.8rem",
                  fontSize: 14,
                  "@media (max-width: 767.95px)": {
                    fontSize: 11,
                  },
                },
              }}
              error={
                touched.protokolPenelitian && Boolean(errors.protokolPenelitian)
              }
            />
            <span className="text-red-500 text-sm font-medium">
              {touched.protokolPenelitian && errors.protokolPenelitian}
            </span>
          </FormRowInput>
          <FormRowInput>
            <span className="font-medium text-sm">
              Curriculum Vitae Peneliti Utama atau Ketua Pelaksana (*)
            </span>

            <MuiFileInput
              id="cv"
              clearIconButtonProps={{
                title: "Remove",
                children: <IoMdClose size={30} />,
              }}
              value={values.cv}
              placeholder="Masukkan CV"
              onChange={(value) => setFieldValue("cv", value)}
              inputProps={{ accept: ".pdf" }}
              onBlur={handleBlur}
              InputProps={{
                sx: {
                  height: "2.8rem",
                  fontSize: 14,
                  "@media (max-width: 767.95px)": {
                    fontSize: 11,
                  },
                },
              }}
              error={touched.cv && Boolean(errors.cv)}
            />
            <span className="text-red-500 text-sm font-medium">
              {touched.cv && errors.cv}
            </span>
          </FormRowInput>
          <FormRowInput>
            <span className="font-medium text-sm">
              Penjelasan untuk Persetujuan Subjek
            </span>

            <MuiFileInput
              id="penjelasanPersetujuan"
              clearIconButtonProps={{
                title: "Remove",
                children: <IoMdClose size={30} />,
              }}
              value={values.penjelasanPersetujuan}
              placeholder="Masukkan File Penjelasan untuk Persetujuan Subjek"
              onChange={(value) =>
                setFieldValue("penjelasanPersetujuan", value)
              }
              inputProps={{ accept: ".pdf" }}
              onBlur={handleBlur}
              InputProps={{
                sx: {
                  height: "2.8rem",
                  fontSize: 14,
                  "@media (max-width: 767.95px)": {
                    fontSize: 11,
                  },
                },
              }}
              error={
                touched.penjelasanPersetujuan &&
                Boolean(errors.penjelasanPersetujuan)
              }
            />
            <span className="text-red-500 text-sm font-medium">
              {touched.penjelasanPersetujuan && errors.penjelasanPersetujuan}
            </span>
          </FormRowInput>
          <FormRowInput>
            <span className="font-medium text-sm">
              Kuesioner/Pedoman Wawancara FGD
            </span>

            <MuiFileInput
              id="kuesioner"
              clearIconButtonProps={{
                title: "Remove",
                children: <IoMdClose size={30} />,
              }}
              value={values.kuesioner}
              placeholder="Masukkan Kuesioner/Pedoman Wawancara"
              onChange={(value) => setFieldValue("kuesioner", value)}
              inputProps={{
                accept: ".pdf",
              }}
              onBlur={handleBlur}
              InputProps={{
                sx: {
                  height: "2.8rem",
                  fontSize: 14,
                  "@media (max-width: 767.95px)": {
                    fontSize: 11,
                  },
                },
              }}
              error={touched.kuesioner && Boolean(errors.kuesioner)}
            />
            <span className="text-red-500 text-sm font-medium">
              {touched.kuesioner && errors.kuesioner}
            </span>
          </FormRowInput>{" "}
        </>
      )}

      <ThemeProvider theme={theme}>
        <Button
          type="submit"
          sx={{ marginTop: "20px", fontSize: 12 }}
          variant="contained"
          color="success"
          className="w-36 h-10"
          disabled={isAdmin ? isPending : id ? isUpdating : isCreating}
        >
          {isAdmin
            ? isPending
              ? "Loading..."
              : "Kirim"
            : id
            ? isUpdating
              ? "Loading..."
              : "Kirim"
            : isCreating
            ? "Loading..."
            : "Ajukan"}
        </Button>
      </ThemeProvider>
    </Form>
  );
}

export default CreateUpdateFormDocuments;
