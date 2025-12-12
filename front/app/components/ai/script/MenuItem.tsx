export default function MenuItem({ icon, label, isOpen, active = false, onClick }: { icon: React.ReactNode, label: string, isOpen: boolean, active?: boolean, onClick?: () => void }) {
    return (
        <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}>
            <div>{icon}</div>
            {isOpen && <span className="font-medium text-sm">{label}</span>}
        </div>
    )
}