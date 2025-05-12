import { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/spinner";
import { Search, Mail, Phone, MessageSquare, BookOpen, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// FAQ data
const faqData = [
  {
    question: "How do I create my first campaign?",
    answer: "To create your first campaign, click on the 'Create New Campaign' button on your dashboard or go to the Campaigns page and click 'Create Campaign'. Follow the step-by-step wizard to select recipients, choose a template, personalize your message, and schedule delivery."
  },
  {
    question: "What file formats can I use for importing recipients?",
    answer: "You can import recipients using CSV or Excel files. Make sure your file includes columns for first name, last name, and address at minimum. Email and company information are also recommended for better personalization."
  },
  {
    question: "How do I use merge fields in my templates?",
    answer: "Merge fields allow you to personalize each letter. Use the format {{fieldName}} in your template. Common fields include {{firstName}}, {{lastName}}, {{company}}, etc. When the letter is generated, these fields will be replaced with the recipient's actual information."
  },
  {
    question: "What is the maximum number of recipients per campaign?",
    answer: "The maximum number of recipients depends on your subscription plan. The Basic plan allows up to 100 recipients per campaign, the Pro plan allows up to 500, and the Enterprise plan has unlimited recipients."
  },
  {
    question: "How long does it take for letters to be delivered?",
    answer: "Physical letters are typically processed within 1-2 business days and then sent via standard mail. Delivery usually takes 3-5 business days within the same country. International delivery may take 7-14 business days depending on the destination."
  },
  {
    question: "Can I track if recipients have received or opened my letters?",
    answer: "Yes, PenPal AI provides tracking for physical letters using QR codes or personalized URLs that can be included in your letters. This allows you to see when a recipient has engaged with your message."
  },
  {
    question: "How do I connect my CRM?",
    answer: "Go to the Integrations page and click 'Add Integration'. Select your CRM provider from the list and follow the instructions to authenticate and connect your account. Once connected, you can import contacts directly from your CRM."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) as well as PayPal. For Enterprise plans, we also offer invoicing options for bank transfers."
  },
];

function Help() {
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Filter FAQs based on search query
  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Setup contact form
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Handle contact form submission
  const onSubmit = (values: z.infer<typeof contactFormSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      form.reset();
      toast({
        title: "Message sent",
        description: "Thank you for contacting us. We'll get back to you as soon as possible.",
      });
    }, 1500);
  };

  return (
    <PageContainer title="Help & Support">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Help & Support</h1>
      </div>

      <div className="mb-8">
        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="md:w-2/3">
                <h2 className="text-xl font-semibold text-primary-800 mb-2">Need help with PenPal AI?</h2>
                <p className="text-primary-700">
                  Find answers in our FAQ, check our documentation, or contact our support team.
                </p>
              </div>
              <div className="md:w-1/3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" size={20} />
                  <Input 
                    placeholder="Search for help..." 
                    className="pl-10 border-primary-200 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="faq">
            <MessageSquare className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="tutorials">
            <Video className="h-4 w-4 mr-2" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Mail className="h-4 w-4 mr-2" />
            Contact Us
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to the most common questions about PenPal AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchQuery && filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No matching FAQs found. Try a different search term or contact us directly.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {(searchQuery ? filteredFaqs : faqData).map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Comprehensive guides and reference materials for PenPal AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-2">Getting Started Guide</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn the basics of PenPal AI and set up your first campaign.
                    </p>
                    <Button variant="outline" size="sm">Read Guide</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-2">Template Creation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Master the art of creating effective letter templates with merge fields.
                    </p>
                    <Button variant="outline" size="sm">Read Guide</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-2">Recipient Management</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn how to import, organize, and manage your recipients efficiently.
                    </p>
                    <Button variant="outline" size="sm">Read Guide</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-2">CRM Integration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect PenPal AI with your favorite CRM systems.
                    </p>
                    <Button variant="outline" size="sm">Read Guide</Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 text-center">
                <Button>View Full Documentation</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tutorials">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Watch step-by-step tutorials to master PenPal AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg overflow-hidden border bg-card">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">Getting Started with PenPal AI</h3>
                    <p className="text-sm text-muted-foreground mt-1">5:32</p>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border bg-card">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">Creating Your First Campaign</h3>
                    <p className="text-sm text-muted-foreground mt-1">8:45</p>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border bg-card">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">Template Design Best Practices</h3>
                    <p className="text-sm text-muted-foreground mt-1">7:18</p>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border bg-card">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">Analyzing Campaign Results</h3>
                    <p className="text-sm text-muted-foreground mt-1">6:54</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Send us a message and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="How can we help you?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please provide as much detail as possible..." 
                                rows={6} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <Spinner size="sm" className="mr-2" />
                          ) : null}
                          Send Message
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Other ways to reach our support team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Email Support</h3>
                        <p className="text-sm text-muted-foreground">support@penpalai.com</p>
                        <p className="text-xs mt-1">Response time: 24-48 hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Phone Support</h3>
                        <p className="text-sm text-muted-foreground">+1 (800) 123-4567</p>
                        <p className="text-xs mt-1">Mon-Fri: 9AM - 5PM EST</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Business Hours</h3>
                      <dl className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <dt>Monday - Friday:</dt>
                          <dd>9:00 AM - 5:00 PM EST</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Saturday:</dt>
                          <dd>Closed</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Sunday:</dt>
                          <dd>Closed</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

export default Help;
