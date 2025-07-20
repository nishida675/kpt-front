import { useCallback } from "react";
import { ProjectDetail } from "@/app/components/type/ticket";

export function useWorkHandlers(
  projectData: ProjectDetail,
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDetail>>,
  setEditTicket: React.Dispatch<
    React.SetStateAction<{ listId: string; ticketId: number; content: string } | null>
  >
) {
  const handleDeleteTicket = useCallback((listId: string, ticketId: number) => {
    setProjectData((prev) => {
      const updatedLists = prev.lists.map((list) => {
        if (list.id === listId) {
          const updatedTickets = list.tickets.filter((t) => t.id !== ticketId);
          return { ...list, tickets: updatedTickets };
        }
        return list;
      });
      return { ...prev, lists: updatedLists };
    });
  }, [setProjectData]);

  const handleEditTicket = useCallback((listId: string, ticketId: number) => {
    const ticket = projectData.lists
      .find((list) => list.id === listId)
      ?.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      setEditTicket({
        listId,
        ticketId,
        content: ticket.content,
      });
    }
  }, [projectData, setEditTicket]);

  const handleEditSave = useCallback((editTicket: {
    listId: string;
    ticketId: number;
    content: string;
  } | null) => {
    if (!editTicket) return;

    setProjectData((prev) => {
      const updatedLists = prev.lists.map((list) => {
        if (list.id === editTicket.listId) {
          const updatedTickets = list.tickets.map((ticket) =>
            ticket.id === editTicket.ticketId
              ? { ...ticket, content: editTicket.content }
              : ticket
          );
          return { ...list, tickets: updatedTickets };
        }
        return list;
      });
      return { ...prev, lists: updatedLists };
    });
    setEditTicket(null);
  }, [setProjectData, setEditTicket]);

   const handleAddTicket = useCallback((
    selectedListId: string,
    newTicketDesc: string,
    setNewTicketDesc: React.Dispatch<React.SetStateAction<string>>,
    setSelectedListId: React.Dispatch<React.SetStateAction<string>>,
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!selectedListId) return;

    const newTicket = {
      id: Date.now(),
      content: newTicketDesc,
      isTemp: true,
    };

    setProjectData((prev) => {
      const updatedLists = prev.lists.map((list) =>
        list.id === selectedListId
          ? { ...list, tickets: [...list.tickets, newTicket] }
          : list
      );
      return { ...prev, lists: updatedLists };
    });

    setNewTicketDesc("");
    setSelectedListId("");
    setIsModalOpen(false);
  }, [setProjectData]);

  return {
    handleDeleteTicket,
    handleEditTicket,
    handleEditSave,
    handleAddTicket,
  };
}
