
type Group = {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
};

type GroupCardProps = {
  group: Group;
  onClick: (groupId: string) => void;
};

export const GroupCard = ({ group, onClick }: GroupCardProps) => {
  return (
    <div
      onClick={() => onClick(group.id)}
      className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{group.avatar}</div>
        <div>
          <h3 className="font-bold">{group.name}</h3>
          <p className="text-sm text-gray-400 truncate">{group.lastMessage}</p>
        </div>
      </div>
    </div>
  );
}; 