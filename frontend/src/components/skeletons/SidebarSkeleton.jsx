import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);
  
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {skeletonContacts.map((_, idx) => {
          return (
            <div key={idx} className="w-full p-3 flex items-center gap-3">
              {/* Skeleton loader for the avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
              {/* Skeleton loader for the name */}
              <div className="w-1/2 h-4 bg-gray-300 animate-pulse"></div>
              {/* Hidden block elements for large screens */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="skeleton h-4 w-32 mb-2" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
