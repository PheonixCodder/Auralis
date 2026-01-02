import { OrganizationList } from "@clerk/nextjs";

const OrgSelectView = () => {
  return (
    <OrganizationList afterCreateOrganizationUrl={"/"} hidePersonal skipInvitationScreen afterSelectPersonalUrl={""} />
  )
}

export default OrgSelectView
