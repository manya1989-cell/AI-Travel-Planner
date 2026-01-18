import React, { useState, useRef, useEffect } from 'react';
import { Send, Plane, MapPin, Calendar, DollarSign, Users, Loader2, Sparkles } from 'lucide-react';

export default function TravelPlanningAgent() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI travel assistant. I can help you plan amazing trips tailored to your preferences. Tell me about your dream destination, budget, travel dates, or what kind of experience you're looking for!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateTravelPlan = async (userMessage) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are a travel planning assistant. The user says: "${userMessage}"

Analyze their request and respond conversationally. If they've provided enough information (destination, budget range, duration, interests), generate a structured travel plan in JSON format at the end of your response.

For a complete request, end your response with:
TRAVEL_PLAN_JSON:
{
  "destination": "City, Country",
  "duration": "X days",
  "budget": "$X,XXX - $X,XXX",
  "highlights": ["Activity 1", "Activity 2", "Activity 3"],
  "itinerary": [
    {"day": 1, "activities": ["Morning: X", "Afternoon: Y", "Evening: Z"]},
    {"day": 2, "activities": ["Morning: X", "Afternoon: Y", "Evening: Z"]}
  ],
  "accommodation": "Suggested hotel type/area",
  "transportation": "How to get around",
  "tips": ["Tip 1", "Tip 2"]
}

Otherwise, ask clarifying questions to gather: destination preferences, budget, travel dates/duration, interests (adventure, culture, relaxation, food, etc.), and travel companions.`
            }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.content[0].text;

      // Extract JSON if present
      const jsonMatch = aiResponse.match(/TRAVEL_PLAN_JSON:\s*({[\s\S]*})/);
      if (jsonMatch) {
        try {
          const planData = JSON.parse(jsonMatch[1]);
          setTripData(planData);
          return aiResponse.replace(/TRAVEL_PLAN_JSON:[\s\S]*/, '').trim();
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      }

      return aiResponse;
    } catch (error) {
      console.error('API Error:', error);
      return "I'm having trouble connecting right now. Could you try again?";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const aiResponse = await generateTravelPlan(userMessage);
    
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Plan a 7-day trip to Japan for $3000",
    "Romantic getaway in Europe",
    "Adventure trip under $2000",
    "Family vacation with kids"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI Travel Planning Agent</h1>
              <p className="text-sm text-gray-600">Powered by Claude Sonnet 4</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl flex flex-col" style={{height: '600px'}}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <p className="text-xs text-gray-500 mb-2">Try these:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-6 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your ideal trip..."
                  className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Trip Summary Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6" style={{height: '600px', overflowY: 'auto'}}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">Trip Overview</h2>
            </div>

            {tripData ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Destination</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{tripData.destination}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <h3 className="font-semibold text-gray-800">Duration</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{tripData.duration}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-yellow-600" />
                    <h3 className="font-semibold text-gray-800">Budget</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{tripData.budget}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Highlights</h3>
                  <ul className="space-y-1">
                    {tripData.highlights?.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Itinerary</h3>
                  <div className="space-y-3">
                    {tripData.itinerary?.map((day, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-lg">
                        <p className="font-semibold text-sm text-gray-800 mb-1">Day {day.day}</p>
                        <ul className="space-y-1">
                          {day.activities?.map((activity, aidx) => (
                            <li key={aidx} className="text-xs text-gray-600">{activity}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Pro Tips</h3>
                  <ul className="space-y-1">
                    {tripData.tips?.map((tip, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">Start chatting to generate your personalized travel plan!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}