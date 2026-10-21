import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";

export default function Users() {
  return (
    <>
      <PageHeader title="Usuarios" />
      <EmptyState icon={GroupOutlinedIcon} title="Próximamente" description="La gestión de usuarios y permisos va a estar disponible pronto." />
    </>
  );
}
