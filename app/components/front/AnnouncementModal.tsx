// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { AnnouncementForm } from "../forms/AnnouncementForm"
// import { Announcement } from "@prisma/client"

// type AnnouncementModalProps = {
//   type: "create" | "update"
//   data?: Announcement
//   trigger: React.ReactNode
// }

// export default function AnnouncementModal({ type, data, trigger }: AnnouncementModalProps) {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         {trigger}
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[600px]">
//         <DialogHeader>
//           <DialogTitle>
//             {type === "create" ? "Create" : "Update"} Announcement
//           </DialogTitle>
//           <DialogDescription>
//             {type === "create" 
//               ? "Add a new announcement"
//               : "Make changes to your announcement"
//             }
//           </DialogDescription>
//         </DialogHeader>
//         <AnnouncementForm initialData={data} />
//       </DialogContent>
//     </Dialog>
//   )
// }
