import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import CampaignWizard from "@/pages/campaign-wizard";
import Recipients from "@/pages/recipients";
import Templates from "@/pages/templates";
import TemplateEditor from "@/pages/template-editor";
import Analytics from "@/pages/analytics";
import Integrations from "@/pages/integrations";
import Settings from "@/pages/settings";
import Help from "@/pages/help";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/campaign-wizard" component={CampaignWizard} />
        <Route path="/campaign-wizard/:step" component={CampaignWizard} />
        <Route path="/recipients" component={Recipients} />
        <Route path="/templates" component={Templates} />
        <Route path="/template-editor" component={TemplateEditor} />
        <Route path="/template-editor/:id" component={TemplateEditor} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={Help} />
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
