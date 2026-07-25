import {
  Calendar,
  CheckCircle,
  Wrench,
} from 'lucide-react'

export default function RecentActivity({ activities = [] }) {

  const icons = {
  booking: <Calendar size={18} color="#1F6F8B" />,
  completed: <CheckCircle size={18} color="#10B981" />,
  profile: <Wrench size={18} color="#F59E0B" />,
}

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px",
          fontSize: "1.1rem",
          fontWeight: "700",
          color: "#0B1F2A",
        }}
      >
        Recent Activity
      </h2>

      {activities.length === 0 ? (
        <p
          style={{
            color: "#6B7280",
            margin: 0,
          }}
        >
          No recent activity.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {activities.map((activity, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >


            <div
               style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#F8FAFC",
                flexShrink: 0,
              }}
              >
             {icons[activity.type]}
            </div>


            

              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: "#0B1F2A",
                  }}
                >
                  {activity.title}
                </p>

                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "0.85rem",
                    color: "#6B7280",
                  }}
                >
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}