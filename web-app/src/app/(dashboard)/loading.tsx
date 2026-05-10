export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
      <div className="h-72 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    </div>
  );
}
