export const INTEGRATIONS = [
  {
    id: "html",
    title: "HTML",
    icon: "/languages/html5.svg",
  },
  {
    id: "react",
    title: "React",
    icon: "/languages/react.svg",
  },
  {
    id: "nextjs",
    title: "Next JS",
    icon: "/languages/nextjs.svg",
  },
];

export type IntegrationId = (typeof INTEGRATIONS)[number]["id"];

export const HTML_SCRIPT = `<script data-organization-id="{{ORGANIZATION_ID}}"></script>`;
export const NEXTJS_SCRIPT = `<script data-organization-id="{{ORGANIZATION_ID}}"></script>`;
export const REACT_SCRIPT = `<script data-organization-id="{{ORGANIZATION_ID}}"></script>`;
