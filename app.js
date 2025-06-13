require("dotenv").config();

const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const { init } = require("bot-ws-plugin-openai");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const { handlerAI } = require("./utils");
const { textToVoice } = require("./services/eventlab");

const employeesAddonConfig = {
  model: "qwen/qwen3-32b:free", // ✅ Modelo de OpenRouter
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY, // ✅ Asegúrate de poner tu clave de OpenRouter aquí
  baseURL: "https://openrouter.ai/api/v1" // ✅ Endpoint de OpenRouter
};

const employeesAddon = init(employeesAddonConfig);

const flowStaff = addKeyword(EVENTS.ACTION).addAnswer(
  ["Claro que te interesa?", "mejor te envio audio.."],
  null,
  async (_, { flowDynamic, state }) => {
    console.log("🙉 texto a voz....");
    const currentState = state.getMyState();
    const path = await textToVoice(currentState.answer);
    console.log(`🙉 Fin texto a voz....[PATH]:${path}`);
    await flowDynamic([{ body: "escucha", media: path }]);
  }
);

const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE).addAction(
  async (ctx, ctxFn) => {
    await ctxFn.flowDynamic("dame un momento para escucharte...🙉");
    console.log("🤖 voz a texto....");
    const text = await handlerAI(ctx);
    console.log(`🤖 Fin voz a texto....[TEXT]: ${text}`);
    const currentState = ctxFn.state.getMyState();
    const fullSentence = `${currentState?.answer ?? ""}. ${text}`;
    const { employee, answer } = await employeesAddon.determine(fullSentence);
    ctxFn.state.update({ answer });
    employeesAddon.gotoFlow(employee, ctxFn);
  }
);

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowVoiceNote, flowStaff]);
  const adapterProvider = createProvider(BaileysProvider);

  /**
   * 🤔 Empleados digitales
   */
  const employees = [
    {
      name: "EMPLEADO_STAFF_TOUR",
      description:
        "Soy Jorge el staff amable encargado de atender las solicitudes de los viajeros si tienen dudas, preguntas sobre el tour o la ciudad de Madrid. Mis respuestas son breves.",
      flow: flowStaff,
    }
  ];

  employeesAddon.employees(employees);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
