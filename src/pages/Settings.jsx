import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";

export default function Settings() {
  return (
    <>
      <PageHeader title="Configuración" />
      <EmptyState icon={SettingsOutlinedIcon} title="Próximamente" description="Los ajustes de la cuenta van a estar disponibles pronto." />
    </>
  );
}
