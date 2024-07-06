import { Button, TableCell, ThemeProvider } from "@mui/material";
import { FiDownload } from "react-icons/fi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import TableStyle from "../../../components/Table";
import ModalComponent from "../../../components/ModalComponent";
import UpdateStatusFormDocuments from "./UpdateStatusFormDocuments";
import { theme } from "../../../utils/theme";

function ReviewerDocumentsRow({ data }) {
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
          width: "500px",
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
        <ThemeProvider theme={theme}>
          <ModalComponent>
            <ModalComponent.OpenButton>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#006A74",
                  marginLeft: "2px",
                  paddingY: "10px",
                  minWidth: "2.5rem",
                  "&:hover": { backgroundColor: "#02575f" },
                }}
              >
                <IoMdCheckmarkCircleOutline size={18} className="text-white" />
              </Button>
            </ModalComponent.OpenButton>
            <ModalComponent.ModalWindow
              title="Status Berkas"
              subtitle="Berikan status berkas untuk berkas ini"
            >
              <UpdateStatusFormDocuments id={data._id} />
            </ModalComponent.ModalWindow>
          </ModalComponent>
        </ThemeProvider>
      </TableCell>

      <TableCell
        sx={{
          fontSize: "0.9rem",
          width: "200px",
        }}
        align="center"
      >
        <div className="flex flex-col justify-center items-center gap-4">
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#006A74",
              marginLeft: "4px",
              paddingY: "10px",
              minWidth: "2.5rem",
              "&:hover": { backgroundColor: "#02575f" },
            }}
            onClick={() => {
              window.location.href = data.documents;
            }}
          >
            <FiDownload size={18} className="text-white" />
          </Button>
        </div>
      </TableCell>
    </TableStyle.Row>
  );
}

export default ReviewerDocumentsRow;
