import { Switch, Route, useLocation } from "wouter";
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
import { useAuth } from "./contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";

function PrivateRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return <Component {...rest} />;
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={() => <PrivateRoute component={Dashboard} />} />
        <Route path="/dashboard" component={() => <PrivateRoute component={Dashboard} />} />
        <Route path="/campaigns" component={() => <PrivateRoute component={Campaigns} />} />
        <Route path="/campaign-wizard" component={() => <PrivateRoute component={CampaignWizard} />} />
        <Route path="/campaign-wizard/:step" component={(params) => <PrivateRoute component={CampaignWizard} params={params} />} />
        <Route path="/recipients" component={() => <PrivateRoute component={Recipients} />} />
        <Route path="/templates" component={() => <PrivateRoute component={Templates} />} />
        <Route path="/template-editor" component={() => <PrivateRoute component={TemplateEditor} />} />
        <Route path="/template-editor/:id" component={(params) => <PrivateRoute component={TemplateEditor} params={params} />} />
        <Route path="/analytics" component={() => <PrivateRoute component={Analytics} />} />
        <Route path="/integrations" component={() => <PrivateRoute component={Integrations} />} />
        <Route path="/settings" component={() => <PrivateRoute component={Settings} />} />
        <Route path="/help" component={() => <PrivateRoute component={Help} />} />
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
