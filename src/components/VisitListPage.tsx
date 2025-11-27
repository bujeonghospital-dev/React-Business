import { useNavigate, useParams } from "react-router-dom";
import VisitListPanel from "./VisitListPanel";

const VisitListPage: React.FC = () => {
    const { cn } = useParams<{ cn: string }>();
    const navigate = useNavigate();

    if (!cn) {
        return <p className="text-sm text-red-600">CN ไม่ถูกต้อง</p>;
    }

    return (
        <div className="space-y-4">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Visit ทั้งหมด</h1>
                <button
                    type="button"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => navigate(`/customers/${cn}/visits/new`)}
                >
                    เพิ่ม Visit
                </button>
            </header>

            <VisitListPanel
                cn={cn}
                onRowClick={(visit) => navigate(`/customers/${cn}/visits/${visit.vn}`)}
            />
        </div>
    );
};

export default VisitListPage;
