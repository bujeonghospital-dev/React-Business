import { useRouter, useParams } from "next/navigation";
import VisitListPanel from "./VisitListPanel";

const VisitListPage: React.FC = () => {
    const params = useParams<{ cn: string }>();
    const cn = params.cn;
    const router = useRouter();

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
                    onClick={() => router.push(`/customers/${cn}/visits/new`)}
                >
                    เพิ่ม Visit
                </button>
            </header>

            <VisitListPanel
                cn={cn}
                onRowClick={(visit) => router.push(`/customers/${cn}/visits/${visit.vn}`)}
            />
        </div>
    );
};

export default VisitListPage;
