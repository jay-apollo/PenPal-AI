import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, Send, Calendar as CalendarIcon2 } from "lucide-react";

interface ScheduleStepProps {
  campaignData: {
    startDate?: Date;
  };
  onUpdateCampaign: (data: any) => void;
  onFinish: () => void;
}

export function ScheduleStep({
  campaignData,
  onUpdateCampaign,
  onFinish,
}: ScheduleStepProps) {
  const [activeTab, setActiveTab] = useState("schedule");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    onUpdateCampaign({ ...campaignData, startDate: date });
  };

  const handleSendNow = () => {
    setIsSubmitting(true);
    // In a real implementation, add validation and API calls
    setTimeout(() => {
      onFinish();
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSchedule = () => {
    if (!campaignData.startDate) return;
    
    setIsSubmitting(true);
    // In a real implementation, add validation and API calls
    setTimeout(() => {
      onFinish();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Schedule Your Campaign</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="schedule">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule for Later
          </TabsTrigger>
          <TabsTrigger value="now">
            <Send className="h-4 w-4 mr-2" />
            Send Now
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <CalendarIcon2 className="h-5 w-5 mr-2 text-neutral-500" />
                    Select Date
                  </h3>
                  <Calendar
                    mode="single"
                    selected={campaignData.startDate}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={{ before: new Date() }}
                  />
                </div>
                
                {/* Time selection */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-neutral-500" />
                    Select Time
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Hour
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Minute
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select minute" />
                        </SelectTrigger>
                        <SelectContent>
                          {["00", "15", "30", "45"].map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        AM/PM
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="am">AM</SelectItem>
                          <SelectItem value="pm">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Schedule summary */}
                  {campaignData.startDate && (
                    <div className="mt-6 p-4 bg-primary-50 rounded-md">
                      <p className="text-primary-700 font-medium">
                        Scheduled for: {format(campaignData.startDate, "PPP")}
                      </p>
                      <p className="text-sm text-primary-600 mt-1">
                        All letters will be processed and sent on this date.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleSchedule}
                  disabled={!campaignData.startDate || isSubmitting}
                >
                  Schedule Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="now">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-6">
                <Send className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Send Campaign Immediately</h3>
                <p className="text-neutral-500 max-w-md mx-auto mb-6">
                  Your letters will be processed and sent out right away. 
                  This cannot be undone once started.
                </p>
                <Button
                  onClick={handleSendNow}
                  disabled={isSubmitting}
                  className="min-w-[150px]"
                >
                  Send Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}