/** Only confirmed addresses. Fill null entries with the owner's real details. */
export const contactDetails: { email: string | null; linkedin: string | null; github: string | null; instagram: string | null } = {
  email: "vicentejoelson80@gmail.com",
  linkedin: "https://www.linkedin.com/in/joelson-vicente-957589278",
  github: "https://github.com/joelsondeveloper",
  instagram: "https://www.instagram.com/_joelson._/",
};
export const contactChannels = [
  { id: "email", label: "E-MAIL", name: "E-mail", rotation: -8 },
  { id: "linkedin", label: "LINKEDIN", name: "LinkedIn", rotation: 3 },
  { id: "github", label: "GITHUB", name: "GitHub", rotation: 5 },
  { id: "instagram", label: "INSTAGRAM", name: "Instagram", rotation: -9 },
] as const;
