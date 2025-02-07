import React, { useEffect } from 'react';
import { useGroupStore } from '../store/useGroupStore';

const GroupPage = () => {
  const { groups, fetchGroups } = useGroupStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Groups</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group._id} className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">{group.name}</h2>
            <p>{group.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupPage;
