import { Button, TableCell, ThemeProvider } from "@mui/material";
import { FiDownload } from "react-icons/fi";
import TableStyle from "../../../components/Table";
import ModalComponent from "../../../components/ModalComponent";
import { theme } from "../../../utils/theme";
import CreateUpdateFormDocuments from "../CreateUpdateFormDocuments";

function ChairDocumentsRow({ data }) {
  return (
    <TableStyle.Row>
      <TableCell
        sx={{
          fontSize: "0.9rem",
          paddingY: "50px",
          paddingLeft: "35px",
          width: "200px",
        }}
      >
        {1}
      </TableCell>

      <TableCell sx={{ fontSize: "0.86rem", width: "300px" }}>
        {data.nameUser}
      </TableCell>

      <TableCell
        sx={{
          fontWeight: "bold",
          fontSize: "0.85rem",
          overflowWrap: "break-word",
          wordWrap: "break-word",
          width: "700px",
        }}
      >
        {data.researchName}
      </TableCell>

      <TableCell
        sx={{
          fontSize: "0.9rem",
          textAlign: "center",
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#547268",
            marginLeft: "6px",
            paddingY: "10px",
            minWidth: "3.8rem",
            "&:hover": { backgroundColor: "#455952" },
          }}
          onClick={() => {
            window.location.href = data.documents;
          }}
        >
          <FiDownload size={18} className="text-white" />
        </Button>
      </TableCell>

      <TableCell
        sx={{
          fontSize: "0.9rem",
          width: "200px",
        }}
        align="center"
      >
        <div className="flex flex-col justify-center items-center gap-4">
          <ThemeProvider theme={theme}>
            <ModalComponent>
              <ModalComponent.OpenButton>
                <Button
                  variant="contained"
                  sx={{
                    width: "5.2rem",
                    backgroundColor: "#006A74",
                    marginLeft: "15px",
                    paddingY: "10px",
                    fontSize: 12,
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#02575f" },
                  }}
                >
                  Upload
                </Button>
              </ModalComponent.OpenButton>
              <ModalComponent.ModalWindow
                title="Upload File"
                subtitle="Unggah file yang akan diberikan"
              >
                <CreateUpdateFormDocuments id={data._id} />
              </ModalComponent.ModalWindow>
            </ModalComponent>
          </ThemeProvider>
        </div>
      </TableCell>
    </TableStyle.Row>
  );
}

export default ChairDocumentsRow;
