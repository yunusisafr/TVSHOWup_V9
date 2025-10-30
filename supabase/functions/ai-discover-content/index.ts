import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey"
};
function getLanguageForCountry(countryCode) {
  const countryToLanguage = {
    "TR": "tr-TR",
    "FR": "fr-FR",
    "DE": "de-DE",
    "ES": "es-ES",
    "IT": "it-IT",
    "PT": "pt-PT",
    "BR": "pt-BR",
    "JP": "ja-JP",
    "KR": "ko-KR",
    "CN": "zh-CN",
    "RU": "ru-RU",
    "NL": "nl-NL",
    "PL": "pl-PL",
    "SE": "sv-SE",
    "NO": "nb-NO",
    "DK": "da-DK",
    "FI": "fi-FI",
    "GR": "el-GR",
    "AR": "es-AR",
    "MX": "es-MX",
    "IN": "hi-IN"
  };
  return countryToLanguage[countryCode.toUpperCase()] || "en-US";
}
function getLanguageCode(fullLanguage) {
  return fullLanguage.split("-")[0];
}
function getNoResultsMessage(languageCode) {
  const messages = {
    "tr": "Üzgünüm, bu arama için sonuç bulamadım. Lütfen farklı bir şey deneyin - örneğin sadece bir tür veya platform söylerseniz size harika öneriler sunabilirim!",
    "de": "Es tut mir leid, ich konnte keine Ergebnisse für diese Suche finden. Bitte versuchen Sie etwas anderes - zum Beispiel, nennen Sie einfach ein Genre oder eine Plattform und ich kann Ihnen tolle Empfehlungen geben!",
    "fr": "Désolé, je n'ai pas trouvé de résultats pour cette recherche. Veuillez essayer quelque chose de différent - par exemple, mentionnez simplement un genre ou une plateforme et je peux vous donner d'excellentes recommandations!",
    "es": "Lo siento, no pude encontrar resultados para esa búsqueda. Por favor, intenta algo diferente - por ejemplo, solo menciona un género o plataforma y puedo darte excelentes recomendaciones!",
    "it": "Mi dispiace, non ho trovato risultati per questa ricerca. Prova qualcosa di diverso - ad esempio, menziona semplicemente un genere o una piattaforma e posso darti ottimi consigli!",
    "pt": "Desculpe, não encontrei resultados para essa pesquisa. Por favor, tente algo diferente - por exemplo, mencione apenas um gênero ou plataforma e posso dar ótimas recomendações!",
    "nl": "Sorry, ik kon geen resultaten vinden voor die zoekopdracht. Probeer iets anders - bijvoorbeeld, noem gewoon een genre of platform en ik kan je geweldige aanbevelingen geven!",
    "pl": "Przepraszam, nie znalazłem wyników dla tego wyszukiwania. Spróbuj czegoś innego - na przykład, po prostu wymień gatunek lub platformę, a mogę podać świetne rekomendacje!",
    "sv": "Förlåt, jag kunde inte hitta resultat för den sökningen. Försök något annat - till exempel, nämn bara en genre eller plattform så kan jag ge dig fantastiska rekommendationer!",
    "da": "Undskyld, jeg kunne ikke finde resultater for den søgning. Prøv noget andet - for eksempel, nævn bare en genre eller platform, og jeg kan give dig fantastiske anbefalinger!",
    "fi": "Anteeksi, en löytänyt tuloksia tälle haulle. Kokeile jotain muuta - esimerkiksi mainitse vain genre tai alusta, niin voin antaa sinulle loistavia suosituksia!",
    "no": "Beklager, jeg fant ingen resultater for det søket. Prøv noe annet - for eksempel, nevn bare en sjanger eller plattform, så kan jeg gi deg flotte anbefalinger!",
    "ru": "Извините, я не смог найти результаты для этого поиска. Попробуйте что-то другое - например, просто укажите жанр или платформу, и я смогу дать вам отличные рекомендации!",
    "ja": "申し訳ございません、その検索結果が見つかりませんでした。別のものを試してください - たとえば、ジャンルやプラットフォームを挙げていただければ、素晴らしいおすすめをご提供できます！",
    "ko": "죄송합니다. 해당 검색에 대한 결과를 찾을 수 없습니다. 다른 것을 시도해보세요 - 예를 들어 장르나 플랫폼만 언급하면 훌륭한 추천을 해드릴 수 있습니다!",
    "zh": "抱歉，我找不到该搜索的结果。请尝试其他内容 - 例如，只需提及类型或平台，我就可以为您提供很棒的推荐！",
    "en": "Sorry, I couldn't find results for that search. Please try something different - for example, just mention a genre or platform and I can give you great recommendations!"
  };
  return messages[languageCode] || messages["en"];
}
function getOffTopicMessage(languageCode) {
  const messages = {
    "tr": "Ben sadece film ve dizi önerileri konusunda yardımcı olabilirim. Diğer konular hakkında bilgim yok.",
    "de": "Ich kann nur bei Film- und Serienempfehlungen helfen. Ich habe keine Informationen zu anderen Themen.",
    "fr": "Je ne peux vous aider qu'avec des recommandations de films et séries. Je n'ai pas d'informations sur d'autres sujets.",
    "es": "Solo puedo ayudar con recomendaciones de películas y series. No tengo información sobre otros temas.",
    "it": "Posso aiutarti solo con raccomandazioni di film e serie TV. Non ho informazioni su altri argomenti.",
    "pt": "Só posso ajudar com recomendações de filmes e séries. Não tenho informações sobre outros assuntos.",
    "nl": "Ik kan alleen helpen met film- en serieaanbevelingen. Ik heb geen informatie over andere onderwerpen.",
    "pl": "Mogę pomóc tylko z rekomendacjami filmów i seriali. Nie mam informacji na inne tematy.",
    "sv": "Jag kan bara hjälpa till med film- och serierekommendationer. Jag har ingen information om andra ämnen.",
    "da": "Jeg kan kun hjælpe med film- og serieanbefalinger. Jeg har ingen information om andre emner.",
    "fi": "Voin auttaa vain elokuva- ja sarjasuosituksissa. Minulla ei ole tietoa muista aiheista.",
    "no": "Jeg kan bare hjelpe med film- og serieanbefalinger. Jeg har ingen informasjon om andre emner.",
    "ru": "Я могу помочь только с рекомендациями фильмов и сериалов. У меня нет информации о других темах.",
    "ja": "映画やテレビ番組のおすすめについてのみお手伝いできます。他のトピックに関する情報は持っていません。",
    "ko": "영화 및 TV 프로그램 추천에 대해서만 도움을 드릴 수 있습니다. 다른 주제에 대한 정보는 없습니다.",
    "zh": "我只能帮助推荐电影和电视节目。我没有关于其他主题的信息。",
    "en": "I can only help you find movies and TV shows. I don't have information about other topics."
  };
  return messages[languageCode] || messages["en"];
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    const { query, conversationHistory = [], countryCode = "US" } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({
        error: "Query is required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("🤖 Processing query:", query);
    console.log("🌍 Country code:", countryCode);
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
    if (!openAIKey || !tmdbApiKey) {
      console.error("❌ Missing API keys");
      return new Response(JSON.stringify({
        error: "API keys not configured",
        success: false
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const params = await parseQueryWithGPT(query, conversationHistory, openAIKey);
    const language = getLanguageForCountry(countryCode);
    const languageCode = getLanguageCode(language);
    console.log(`🌍 Detected language: ${language} (code: ${languageCode})`);
    if (params.detectedMood) {
      console.log(`🎭 Mood detected: ${params.detectedMood} (confidence: ${params.moodConfidence}%)`);
    }
    if (params.isVagueQuery && !params.detectedMood) {
      console.log("💭 Vague query with no mood - will show trending content");
    }
    if (params.isOffTopic) {
      return new Response(JSON.stringify({
        success: true,
        results: [],
        responseText: getOffTopicMessage(languageCode),
        isOffTopic: true,
        topicChanged: false
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // 🎬 HANDLE SCENE/DETAIL QUERY - Ask AI to identify the movie FIRST
    if (params.isSceneDetailQuery && params.sceneDescription) {
      console.log("🎬 Scene/detail query detected:", params.sceneDescription);
      console.log("🤖 Asking AI to identify the specific movie/show...");

      const scenePrompt = `You are a movie and TV show expert. Identify the EXACT title from this scene description:

"${query}"

CRITICAL RULES:
- Respond with ONLY the movie/TV show title in its ORIGINAL language (English for Hollywood, Turkish for Turkish content, etc.)
- If you're 100% CERTAIN, respond with just the title: "Title Name"
- If you're NOT certain or don't know, respond with EXACTLY: "UNCERTAIN"
- DO NOT add explanations, years, or extra information
- DO NOT guess if you're not certain

Examples:
- "şener şenin domates sattığı film" → "Züğürt Ağa"
- "jim carrey wearing a green mask" → "The Mask"
- "tom hanks running across america" → "Forrest Gump"

Title:`;

      try {
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAIKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{
              role: "user",
              content: scenePrompt
            }],
            max_tokens: 50,
            temperature: 0.1
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const identifiedTitle = aiData.choices?.[0]?.message?.content?.trim();

          if (identifiedTitle && identifiedTitle !== "UNCERTAIN" && !identifiedTitle.toLowerCase().includes("uncertain")) {
            console.log(`✅ AI identified title: "${identifiedTitle}"`);

            // Now search TMDB with this specific title
            const titleResults = await searchByTitle(identifiedTitle, params.contentType || "both", tmdbApiKey, language);

            if (titleResults.length > 0) {
              console.log(`✅ Found ${titleResults.length} results for "${identifiedTitle}"`);

              // Generate friendly response
              const responses: { [key: string]: string } = {
                tr: `Aradığınız film: "${identifiedTitle}"! ${titleResults.length > 1 ? 'İlgili diğer öneriler de aşağıda.' : ''}`,
                en: `Found it: "${identifiedTitle}"! ${titleResults.length > 1 ? 'Related suggestions below.' : ''}`,
                de: `Gefunden: "${identifiedTitle}"! ${titleResults.length > 1 ? 'Weitere Vorschläge unten.' : ''}`,
                fr: `Trouvé: "${identifiedTitle}"! ${titleResults.length > 1 ? 'Autres suggestions ci-dessous.' : ''}`,
                es: `Encontrado: "${identifiedTitle}"! ${titleResults.length > 1 ? 'Más sugerencias abajo.' : ''}`
              };

              const responseText = responses[languageCode] || responses.en;

              return new Response(JSON.stringify({
                success: true,
                results: titleResults.slice(0, 5), // Max 5 results for scene queries
                responseText: responseText,
                isOffTopic: false,
                topicChanged: false,
                params: { ...params, specificTitle: identifiedTitle },
                identifiedFromScene: true,
                identifiedTitle: identifiedTitle
              }), {
                headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json"
                }
              });
            } else {
              console.log(`⚠️ No TMDB results found for identified title: "${identifiedTitle}"`);
            }
          } else {
            console.log("⚠️ AI couldn't identify the movie with certainty");
          }
        }
      } catch (error) {
        console.error("❌ Error identifying title from scene:", error);
      }

      // If AI couldn't help, return no results message
      return new Response(JSON.stringify({
        success: true,
        results: [],
        responseText: getNoResultsMessage(languageCode),
        isOffTopic: false,
        topicChanged: false
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    let personInfo = null;
    let contentInfo = null;
    if (params.isPersonQuery && params.personName) {
      console.log("🎭 Person query detected:", params.personName);
      personInfo = await getPersonInfo(params.personName, tmdbApiKey, language);
    }
    if (params.isContentInfoQuery && params.specificTitle) {
      console.log("🎬 Content info query detected:", params.specificTitle);
      contentInfo = await getContentInfo(params.specificTitle, params.contentType || "both", tmdbApiKey, language);
    }
    const topicChanged = detectTopicChange(query, conversationHistory, params);
    let results = await searchTMDB(params, tmdbApiKey, countryCode, language);
    if (results.length === 0 && (personInfo || contentInfo)) {
      console.log("🔄 No direct results, fetching related content...");
      if (personInfo) {
        const personContent = await searchByPerson(personInfo.name, params.contentType || "both", tmdbApiKey, undefined, language);
        results = personContent.slice(0, 20);
        console.log(`✅ Found ${results.length} titles featuring ${personInfo.name}`);
      } else if (contentInfo) {
        const similarContent = await getRelatedContent(contentInfo.id, contentInfo.content_type, tmdbApiKey, language);
        results = similarContent.slice(0, 20);
        console.log(`✅ Found ${results.length} similar titles`);
      }
    }
    const responseText = await generateFriendlyResponse(query, params, results, openAIKey, languageCode, personInfo, contentInfo);
    return new Response(JSON.stringify({
      success: true,
      results,
      responseText,
      isOffTopic: false,
      topicChanged,
      params,
      personInfo,
      contentInfo,
      detectedMood: params.detectedMood || null,
      moodConfidence: params.moodConfidence || null,
      isVagueQuery: params.isVagueQuery || false
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Internal server error",
      results: [],
      responseText: "Sorry, something went wrong."
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
function detectTopicChange(currentQuery, history, currentParams) {
  if (!history || history.length < 2) return false;
  const lastUserMsg = [
    ...history
  ].reverse().find((msg)=>msg.role === "user");
  if (!lastUserMsg) return false;
  const current = currentQuery.toLowerCase();
  const newTopicKeywords = [
    "now",
    "instead",
    "switch",
    "change",
    "different",
    "şimdi",
    "bunun yerine",
    "başka"
  ];
  const hasNewTopicIndicator = newTopicKeywords.some((keyword)=>current.includes(keyword));
  if (currentParams.specificTitle) return true;
  const hasGenreChange = currentParams.genres && currentParams.genres.length > 0;
  const hasProviderChange = currentParams.providers && currentParams.providers.length > 0;
  const hasPersonChange = currentParams.personName !== null;
  const refiningKeywords = [
    "but",
    "except",
    "with",
    "also",
    "and",
    "plus",
    "ama",
    "ve",
    "ayrıca",
    "ile"
  ];
  const isRefining = refiningKeywords.some((keyword)=>current.includes(keyword));
  if (hasNewTopicIndicator) return true;
  if (!isRefining && (hasGenreChange || hasProviderChange || hasPersonChange)) {
    return true;
  }
  return false;
}
async function generateFriendlyResponse(query, params, results, apiKey, languageCode, personInfo, contentInfo) {
  const resultCount = results.length;
  const contentType = params.contentType === "movie" ? "movies" : params.contentType === "tv" ? "shows" : "titles";
  let contextInfo = "";
  if (personInfo) {
    const age = personInfo.birthday ? new Date().getFullYear() - new Date(personInfo.birthday).getFullYear() : null;
    contextInfo = `\n\nPerson Info Found:
- Name: ${personInfo.name}
- Age: ${age || "Unknown"}
- Birthday: ${personInfo.birthday || "Unknown"}
- Birthplace: ${personInfo.place_of_birth || "Unknown"}
- Known for: ${personInfo.known_for_department || "Unknown"}
- Biography: ${personInfo.biography?.substring(0, 200) || "N/A"}`;
  }
  if (contentInfo) {
    contextInfo = `\n\nContent Info Found:
- Title: ${contentInfo.title || contentInfo.name}
- Type: ${contentInfo.content_type === "movie" ? "Movie" : "TV Show"}
- Rating: ${contentInfo.vote_average?.toFixed(1) || "N/A"}
- Release: ${contentInfo.release_date || contentInfo.first_air_date || "Unknown"}
- Runtime: ${contentInfo.runtime ? `${contentInfo.runtime} min` : "N/A"}
- Seasons: ${contentInfo.number_of_seasons || "N/A"}
- Director: ${contentInfo.director || "N/A"}
- Cast: ${contentInfo.cast?.slice(0, 3).join(", ") || "N/A"}
- Genres: ${contentInfo.genres?.join(", ") || "N/A"}
- Overview: ${contentInfo.overview?.substring(0, 200) || "N/A"}`;
  }
  if (resultCount === 0 && !personInfo && !contentInfo) {
    console.log("⚠️ No TMDB results found, attempting AI knowledge fallback...");
    // Check if this is a specific scene/quote/detail query
    const isSceneQuery = // Speaking/saying patterns
    query.toLowerCase().includes("diye bağır") || query.toLowerCase().includes("diye söyle") || query.toLowerCase().includes("dedi") || query.toLowerCase().includes("says") || query.toLowerCase().includes("said") || query.toLowerCase().includes("yells") || query.toLowerCase().includes("screams") || query.toLowerCase().includes("sings") || query.toLowerCase().includes("quote") || // Scene/action patterns
    query.toLowerCase().includes("sahnesi") || query.toLowerCase().includes("sahne") || query.toLowerCase().includes("scene where") || query.toLowerCase().includes("scene with") || query.toLowerCase().includes("movie where") || query.toLowerCase().includes("show where") || query.toLowerCase().includes("film where") || query.toLowerCase().includes("dizi") || // Clothing/appearance patterns
    query.toLowerCase().includes("giyen") || query.toLowerCase().includes("giydiği") || query.toLowerCase().includes("giymiş") || query.toLowerCase().includes("wearing") || query.toLowerCase().includes("wears") || query.toLowerCase().includes("dressed") || // Action patterns (Turkish)
    query.toLowerCase().includes("koşan") || query.toLowerCase().includes("koştuğu") || query.toLowerCase().includes("dans eden") || query.toLowerCase().includes("dans ettiği") || query.toLowerCase().includes("şarkı söyleyen") || query.toLowerCase().includes("ağlayan") || query.toLowerCase().includes("ağladığı") || // Action patterns (English)
    query.toLowerCase().includes("running") || query.toLowerCase().includes("dancing") || query.toLowerCase().includes("crying") || query.toLowerCase().includes("fighting") || query.toLowerCase().includes("driving") || // Context patterns - person + descriptive action
    query.match(/\b\w+\s+(giyen|giydiği|koşan|dans\s+eden|where\s+he|where\s+she)/i) !== null;
    if (isSceneQuery) {
      console.log("🎬 Scene/quote query detected, asking AI for specific title...");
      const scenePrompt = `You are a movie and TV show expert. Identify the EXACT title from this description:

"${query}"

CRITICAL RULES:
- Respond with ONLY the movie/TV show title in its ORIGINAL language (English for Hollywood, Turkish for Turkish content, etc.)
- If you're 100% CERTAIN, respond with just the title: "Title Name"
- If you're NOT certain or don't know, respond with EXACTLY: "UNCERTAIN"
- DO NOT add explanations, years, or extra information
- DO NOT guess if you're not certain

Title:`;
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: scenePrompt
              }
            ],
            max_tokens: 50,
            temperature: 0.1
          })
        });
        if (response.ok) {
          const data = await response.json();
          const identifiedTitle = data.choices?.[0]?.message?.content?.trim();
          if (identifiedTitle && identifiedTitle !== "UNCERTAIN" && !identifiedTitle.toLowerCase().includes("uncertain")) {
            console.log(`✅ AI identified title: "${identifiedTitle}"`);
            return `SEARCH_TITLE:${identifiedTitle}`;
          }
        }
      } catch (error) {
        console.error("❌ Error identifying title from scene:", error);
      }
    }
    const isInformationalQuery = query.toLowerCase().includes("hakkında") || query.toLowerCase().includes("about") || query.toLowerCase().includes("ne zaman") || query.toLowerCase().includes("when") || query.toLowerCase().includes("kim") || query.toLowerCase().includes("who") || query.toLowerCase().includes("kaç") || query.toLowerCase().includes("how many") || query.toLowerCase().includes("how old") || query.toLowerCase().includes("konusu") || query.toLowerCase().includes("plot") || query.toLowerCase().includes("story") || query.toLowerCase().includes("nerede") || query.toLowerCase().includes("where");
    if (isInformationalQuery) {
      const aiPrompt = `You are a movie and TV show expert. Answer this question using ONLY your certain knowledge:

"${query}"

CRITICAL RULES:
- ONLY answer if you are 100% CERTAIN about the facts (dates, names, numbers)
- Be concise (1-2 sentences max)
- Provide FACTUAL information: ages, birth dates, release dates, directors, actors
- DO NOT mention databases or searching
- If you're NOT 100% certain, respond with EXACTLY: "UNCERTAIN"
- Be natural and conversational
- Speak in the same language as the query

Answer:`;
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: aiPrompt
              }
            ],
            max_tokens: 150,
            temperature: 0.1
          })
        });
        if (response.ok) {
          const data = await response.json();
          const aiAnswer = data.choices?.[0]?.message?.content?.trim();
          const isUncertain = !aiAnswer || aiAnswer === "UNCERTAIN" || aiAnswer.toLowerCase().includes("don't have") || aiAnswer.toLowerCase().includes("don't know") || aiAnswer.toLowerCase().includes("not sure") || aiAnswer.toLowerCase().includes("uncertain") || aiAnswer.toLowerCase().includes("bilmiyorum") || aiAnswer.toLowerCase().includes("emin değilim");
          if (!isUncertain) {
            console.log("✅ AI provided certain knowledge:", aiAnswer);
            return aiAnswer;
          } else {
            console.log("⚠️ AI is uncertain, providing fallback message");
          }
        }
      } catch (error) {
        console.error("❌ Error getting AI answer:", error);
      }
    }
    return getNoResultsMessage(languageCode);
  }
  let moodContext = "";
  if (params.detectedMood && params.moodConfidence && params.moodConfidence > 60) {
    const moodDescriptions = {
      sad: {
        en: "I noticed you're feeling down. I've found uplifting content to cheer you up!",
        tr: "Üzüldüğünüzü fark ettim. Sizi neşelendirecek içerikler buldum!",
        de: "Ich habe bemerkt, dass Sie sich niedergeschlagen fühlen. Ich habe aufmunternde Inhalte gefunden!",
        fr: "J'ai remarqué que vous vous sentez triste. J'ai trouvé du contenu réconfortant!",
        es: "Noté que te sientes triste. ¡He encontrado contenido animador!"
      },
      happy: {
        en: "Great to see you're in a good mood! Here's some feel-good content to keep the vibe going!",
        tr: "Keyfiniýn yerinde olduğunu görmek harika! Ruh halinizi koruyacak içerikler buldum!",
        de: "Schön zu sehen, dass Sie gute Laune haben! Hier ist fröhlicher Inhalt!",
        fr: "Ravi de voir que vous êtes de bonne humeur! Voici du contenu joyeux!",
        es: "¡Genial verte de buen humor! ¡Aquí hay contenido alegre!"
      },
      bored: {
        en: "Feeling bored? I've got exciting, high-energy content to grab your attention!",
        tr: "Sıkılıyor musun? Dikkatini çekecek heyecanlı içerikler buldum!",
        de: "Gelangweilt? Ich habe spannende, energiegeladene Inhalte gefunden!",
        fr: "Vous vous ennuyez? J'ai trouvé du contenu passionnant et énergique!",
        es: "¿Aburrido? ¡Tengo contenido emocionante y energético!"
      },
      excited: {
        en: "Love the energy! I've found thrilling content that matches your excitement!",
        tr: "Bu enerji harika! Heyecanınıza uygun adrenalin dolu içerikler buldum!",
        de: "Tolle Energie! Ich habe aufregende Inhalte gefunden!",
        fr: "J'adore l'énergie! J'ai trouvé du contenu palpitant!",
        es: "¡Me encanta la energía! ¡He encontrado contenido emocionante!"
      },
      tired: {
        en: "I can tell you're tired. Here's some easy-to-watch, relaxing content!",
        tr: "Yorgun olduğunuzu anlayabiliyorum. İzlemesi kolay, rahatlatıcı içerikler buldum!",
        de: "Ich merke, dass Sie müde sind. Hier ist leicht zu schauender, entspannender Inhalt!",
        fr: "Je vois que vous êtes fatigué. Voici du contenu facile à regarder et relaxant!",
        es: "Veo que estás cansado. ¡Aquí hay contenido fácil de ver y relajante!"
      },
      relaxed: {
        en: "Perfect time to unwind! I've found calm, soothing content for you!",
        tr: "Rahatlamak için mükemmel zaman! Sakin, h uzurlu içerikler buldum!",
        de: "Perfekte Zeit zum Entspannen! Ich habe ruhige, beruhigende Inhalte gefunden!",
        fr: "Parfait pour se détendre! J'ai trouvé du contenu calme et apaisant!",
        es: "¡Momento perfecto para relajarse! ¡He encontrado contenido tranquilo!"
      },
      stressed: {
        en: "I sense you need a break. Here's stress-free content to help you relax!",
        tr: "Bir molaya ihtiyacınız olduğunu hissediyorum. Rahatlamanız için stressiz içerikler buldum!",
        de: "Ich spüre, dass Sie eine Pause brauchen. Hier ist stressfreier Inhalt!",
        fr: "Je sens que vous avez besoin d'une pause. Voici du contenu sans stress!",
        es: "Siento que necesitas un descanso. ¡Aquí hay contenido sin estrés!"
      },
      romantic: {
        en: "Feeling romantic? I've found beautiful love stories for you!",
        tr: "Romantik hissediyor musun? Seninçin güzel aşk hikayeleri buldum!",
        de: "Romantisch gestimmt? Ich habe schöne Liebesgeschichten gefunden!",
        fr: "Vous vous sentez romantique? J'ai trouvé de belles histoires d'amour!",
        es: "¿Sintiendo romántico? ¡He encontrado hermosas historias de amor!"
      },
      nostalgic: {
        en: "Missing the good old days? Here are some classic gems from the past!",
        tr: "Eski günleri özledin mi? Geçmişten klasik içerikler buldum!",
        de: "Vermissen Sie die gute alte Zeit? Hier sind klassische Perlen aus der Vergangenheit!",
        fr: "Vous manquez les bons vieux jours? Voici des classiques du passé!",
        es: "¿Extrañas los viejos tiempos? ¡Aquí hay clásicos del pasado!"
      },
      angry: {
        en: "I can sense your mood. Here's intense content to match your energy!",
        tr: "Ruh halini anlayabiliyorum. Enerjine uygun yoğun içerikler buldum!",
        de: "Ich spüre Ihre Stimmung. Hier ist intensiver Inhalt!",
        fr: "Je ressens votre humeur. Voici du contenu intense!",
        es: "Puedo sentir tu estado de ánimo. ¡Aquí hay contenido intenso!"
      }
    };
    const moodKey = params.detectedMood;
    if (moodDescriptions[moodKey]) {
      moodContext = `\n\nDetected Mood: ${params.detectedMood} (confidence: ${params.moodConfidence}%)\nMood Acknowledgment: "${moodDescriptions[moodKey][languageCode] || moodDescriptions[moodKey].en}"`;
    }
  }
  let queryTypeContext = "";
  if (params.isVagueQuery && !params.detectedMood) {
    queryTypeContext = `\n\nQuery Type: Vague with no specific preferences or mood\nApproach: Showing trending popular content as a conversation starter. Gently encourage them to share preferences.`;
  } else if (params.detectedMood) {
    queryTypeContext = `\n\nQuery Type: Mood-based recommendation\nApproach: Empathetically acknowledge their emotional state and explain how the content matches their mood.`;
  }
  // Build actual titles list for AI to reference
  const actualTitlesList = results.slice(0, 5).map((r)=>{
    const name = r.title || r.name || "Unknown";
    const year = r.release_date ? new Date(r.release_date).getFullYear() : r.first_air_date ? new Date(r.first_air_date).getFullYear() : "?";
    const rating = r.vote_average ? r.vote_average.toFixed(1) : "N/A";
    return `- "${name}" (${year}, ${rating}/10)`;
  }).join("\n");
  const prompt = `You are a friendly, warm, emotionally intelligent streaming content assistant. Generate a natural, conversational response to the user's query.

User asked: "${query}"

${contextInfo}${moodContext}${queryTypeContext}

We found ${resultCount} ${contentType}.

${actualTitlesList ? `\n🎬 ACTUAL RESULTS FROM DATABASE:\n${actualTitlesList}\n` : ""}

🚨🚨🚨 ABSOLUTE RULES - VIOLATION = COMPLETE FAILURE 🚨🚨🚨

YOU WILL BE FIRED IF YOU BREAK THESE RULES:

1. ❌ NEVER INVENT numbers, titles, or details - ONLY use what's in the list above
2. ❌ NEVER say "88 films" or any number you calculated yourself - ONLY say ${resultCount}
3. ❌ NEVER mention ANY title not in "ACTUAL RESULTS FROM DATABASE"
4. ❌ NEVER make up cast, directors, years, ratings, or any metadata
5. ❌ If you don't see it in the list above → YOU DON'T KNOW IT → DON'T SAY IT
6. ✅ ONLY safe phrases: "We found ${resultCount} titles", "The results are showing below", "Take a look at the options"

Generate a response (1-2 sentences MAX) that:
1. If SPECIFIC TITLE (1 result): Use ONLY that title from the list, mention its year/rating from the list
2. If MOOD detected: Acknowledge mood + "Here are ${resultCount} suggestions"
3. If PERSON search: "I found ${resultCount} titles with [Person Name]"
4. For ALL other cases: "I found ${resultCount} great options for you!" + guide them to browse

🚨 FORBIDDEN PHRASES 🚨
- "88 films by..." ❌
- Any specific number except ${resultCount} ❌
- Any title not in the results list ❌
- "including..." ❌ (Don't list titles!)
- Any cast/director names not provided ❌

✅ SAFE TEMPLATE:
"I found ${resultCount} [type] for you! [Optional: mood/context]. Take a look at the results below."

CRITICAL: If unsure → Use the safe template. Better boring than wrong!

🌍🌍🌍 LANGUAGE RULES - ABSOLUTE PRIORITY 🌍🌍🌍

YOU MUST respond in the EXACT same language as the user's query:

Language Detection:
- User query language code: ${languageCode}
- If Turkish words detected (film, dizi, gibi, için, olan, var) → Respond in TURKISH
- If English words detected (movie, show, like, with, where) → Respond in ENGLISH
- If German words detected (Film, Serie, mit) → Respond in GERMAN
- If French words detected (film, série, avec) → Respond in FRENCH
- If Spanish words detected (película, serie, con) → Respond in SPANISH

EXAMPLES:
- Query: "jim carrey'nin smokin giydiği film" → TURKISH: "Aradığınız film: 'The Mask'!"
- Query: "jim carrey wearing a mask" → ENGLISH: "Found it: 'The Mask'!"
- Query: "jim carrey mit Maske" → GERMAN: "Gefunden: 'The Mask'!"

🚨 CRITICAL: Match the user's language EXACTLY. Do NOT mix languages!

Keep it warm, conversational, and helpful. Respond with just the message text, no quotes or extra formatting.

Match the emotional tone if mood detected (upbeat for happy, gentle for sad, energetic for bored).`;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.1
      })
    });
    if (!response.ok) {
      return `I found ${resultCount} great ${contentType} for you! Let me know if you'd like to refine your search.`;
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || `I found ${resultCount} great ${contentType} for you! Let me know if you'd like to refine your search.`;
  } catch (error) {
    console.error("Error generating friendly response:", error);
    return `I found ${resultCount} great ${contentType} for you! Let me know if you'd like to refine your search.`;
  }
}
async function parseQueryWithGPT(query, conversationHistory, apiKey) {
  const currentYear = new Date().getFullYear();
  const systemPrompt = `You are an expert at understanding movie/TV show requests and converting them to TMDB API parameters.

🎭🎭🎭 ABSOLUTE HIGHEST PRIORITY: MOOD DETECTION 🎭🎭🎭

BEFORE analyzing anything else, you MUST detect the user's emotional state or mood.

MOOD DETECTION RULES (PRIORITY #1):

1. EXPLICIT MOOD KEYWORDS - Check for these FIRST:

TURKISH:
- Sad/Down: "üzgünüm", "üzülüyorum", "kötü hissediyorum", "moralsizim", "depresyondayım", "kırıkım"
- Happy/Joyful: "mutluyum", "neşeliyim", "keyifliyim", "harikayım", "muhteşem hissediyorum"
- Bored: "sıkılıyorum", "canım sıkılıyor", "sıkıldım", "bıktım", "can sıkıntısı"
- Excited: "heyecanlıyım", "coşkuluyum", "heyecan arıyorum", "adrenalin istiyorum"
- Tired/Exhausted: "yorgunum", "bitkinim", "tükenmiş hissediyorum", "enerjim yok"
- Relaxed/Calm: "rahatlamak istiyorum", "sakinleşmek istiyorum", "huzur arıyorum", "dinlenmek istiyorum"
- Stressed/Anxious: "stresli", "gerginim", "kafam karışık", "endişeliyim", "bunalmış hissediyorum"
- Romantic: "romantik hissediyorum", "aşık gibiyim", "sevgi dolu"
- Nostalgic: "nostaljik", "eski günleri özledim", "geçmişi hatırlamak istiyorum"
- Angry: "sinirliyim", "öfkeliyim", "kızmış durumdayım"

ENGLISH:
- Sad/Down: "sad", "depressed", "feeling down", "blue", "heartbroken", "miserable", "upset"
- Happy/Joyful: "happy", "joyful", "cheerful", "great", "wonderful", "fantastic", "amazing"
- Bored: "bored", "boring day", "nothing to do", "fed up"
- Excited: "excited", "pumped", "hyped", "thrilled", "energetic"
- Tired/Exhausted: "tired", "exhausted", "drained", "worn out", "no energy"
- Relaxed/Calm: "want to relax", "need to unwind", "chill", "peaceful", "calm down"
- Stressed/Anxious: "stressed", "anxious", "overwhelmed", "tense", "worried"
- Romantic: "romantic mood", "in love", "feeling romantic"
- Nostalgic: "nostalgic", "miss the old days", "reminiscing"
- Angry: "angry", "mad", "furious", "pissed off"

GERMAN:
- Sad/Down: "traurig", "niedergeschlagen", "deprimiert", "schlecht gelaunt"
- Happy/Joyful: "glücklich", "fröhlich", "gut gelaunt", "fantastisch"
- Bored: "gelangweilt", "Langeweile", "nichts zu tun"
- Excited: "aufgeregt", "begeistert", "voller Energie"
- Tired: "müde", "erschöpft", "kaputt"
- Relaxed: "entspannen", "relaxen", "ruhig"
- Stressed: "gestresst", "angespannt", "überfordert"

FRENCH:
- Sad/Down: "triste", "déprimé", "mal", "cafardeux"
- Happy/Joyful: "heureux", "joyeux", "content", "ravi"
- Bored: "ennuyé", "s'ennuie", "marre"
- Excited: "excité", "enthousiaste", "énergique"
- Tired: "fatigué", "épuisé", "crevé"
- Relaxed: "se détendre", "relaxer", "calme"
- Stressed: "stressé", "anxieux", "tendu"

SPANISH:
- Sad/Down: "triste", "deprimido", "mal", "desanimado"
- Happy/Joyful: "feliz", "alegre", "contento", "genial"
- Bored: "aburrido", "harto", "sin nada que hacer"
- Excited: "emocionado", "entusiasmado", "con energía"
- Tired: "cansado", "agotado", "exhausto"
- Relaxed: "relajarse", "tranquilo", "descansar"
- Stressed: "estresado", "ansioso", "agobiado"

2. IMPLICIT MOOD INDICATORS - Analyze writing style:
- Multiple exclamation marks (!!!) → Excited/Energetic
- Ellipsis (...) → Contemplative/Sad/Tired
- ALL CAPS → Very excited or angry
- Very short responses (1-3 words) → Tired/Bored/Low energy
- Emojis: 😢😔😞 → Sad, 😊😄😁 → Happy, 😴😩 → Tired, 🤔💭 → Contemplative

3. CONTEXTUAL MOOD PHRASES:
- "ağır bir şey", "heavy content" → Contemplative/Serious mood
- "hafif bir şey", "light content" → Tired/Want easy viewing
- "eğlenceli", "fun", "lustig" → Happy/Playful mood
- "derin", "deep", "profound" → Contemplative/Philosophical
- "hızlı", "fast-paced", "schnell" → Excited/Energetic

4. MOOD-TO-CONTENT MAPPING (Apply when mood detected):

SAD/DOWN → Comedy (35) + high ratings (7.0+) OR uplifting Drama (18)
  - Goal: Cheer up the user
  - Keywords: "heartwarming", "uplifting", "feel-good"
  - Avoid: Dark dramas, tragedies, depressing content

HAPPY/JOYFUL → Feel-good content, Comedy (35), Romance (10749), Adventure (12)
  - Goal: Maintain positive mood
  - Light, fun, entertaining content

BORED → Action (28), Thriller (53), Mystery (9648)
  - Goal: High energy, engaging, fast-paced
  - minRating: 6.5+ (quality matters when bored)
  - Avoid: Slow-paced, documentaries

EXCITED → Action (28), Adventure (12), Sci-Fi (878)
  - Goal: Match high energy
  - Big blockbusters, thrilling content

TIRED/EXHAUSTED → Light Comedy (35), Animation (16), Documentary (99)
  - Goal: Easy to watch, not demanding
  - Avoid: Complex plots, heavy dramas
  - Prefer: Shorter runtime (under 100min for movies)

RELAXED/CALM → Documentary (99), Drama (18), Romance (10749)
  - Goal: Peaceful, soothing content
  - Nature documentaries, calm dramas
  - Avoid: Action, horror, thriller

STRESSED/ANXIOUS → Light Comedy (35), Feel-good content
  - Goal: Stress relief, distraction
  - Avoid: Thriller, Horror, intense Drama

ROMANTIC → Romance (10749), Drama (18)
  - Goal: Love stories, emotional connection

NOSTALGIC → Older content (yearStart: 1980-2000)
  - Classic movies/shows from past decades

ANGRY → Action (28), Thriller (53) OR Comedy (35) for release
  - Intense action for catharsis OR comedy to lighten mood

5. CRITICAL DECISION FLOW:
   Step 1: Check for ANY mood indicators (explicit or implicit)
   Step 2: If mood detected → Set detectedMood, moodConfidence (0-100), apply mood-based genres
   Step 3: If NO mood AND NO specific preferences → Set isVagueQuery: true, useTrendingAPI: true
   Step 4: If mood + specific preferences → Combine both (mood-based genres + user preferences)

⚠️ CRITICAL: If ANY mood is detected, NEVER set useTrendingAPI: true (unless explicitly requested)

CONVERSATION CONTEXT:
- You will receive conversation history - ALWAYS consider previous messages for context
- Track mood across conversation - mood can change between messages

STREAMING PROVIDERS (use provider IDs):
- Netflix: 8
- Amazon Prime: 9
- Disney+: 337
- HBO Max/Max: 1899
- Hulu: 15
- Apple TV+: 350
- Paramount+: 531

PROVIDER NAME VARIATIONS:
- "Apple TV", "Apple content", "Apple" → Apple TV+ (350)
- "Max", "HBO Max", "HBO" → Max (1899)
- "Prime", "Amazon Prime Video", "Amazon" → Amazon Prime (9)
- "Disney Plus", "Disney", "Disney+" → Disney+ (337)

GENRES: Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80, Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, Horror: 27, Mystery: 9648, Romance: 10749, Sci-Fi: 878, Thriller: 53, War: 10752, Western: 37

⚠️⚠️⚠️ RATING RULES - READ CAREFULLY ⚠️⚠️⚠️

DEFAULT BEHAVIOR (MOST IMPORTANT):
- If user does NOT explicitly mention quality → minRating: 0 (NO FILTER!)
- "öneri", "recommendation", "suggest", "film bul", "dizi öner" → minRating: 0
- "Netflix'te film", "aksiyon filmi", "komedi" → minRating: 0
- "güzel", "nice", "good", "hoş", "keyifli" → minRating: 0 (these are too vague!)

ONLY ADD minRating IF USER IS EXPLICIT:
- "en iyi", "top rated", "highest rated", "çok iyi puanlı" → minRating: 7.5
- "yüksek puanlı", "high rated", "iyi puanlı" → minRating: 7.0
- "kaliteli", "quality", "well-rated" → minRating: 6.5
- "mükemmel", "excellent", "masterpiece" → minRating: 8.0

RULE OF THUMB: When in doubt, use minRating: 0

⚠️⚠️⚠️ CONTENT TYPE DETECTION - CRITICAL ⚠️⚠️⚠️

TURKISH (VERY IMPORTANT):
- "dizi film" → contentType: "tv" (NOT both! This means TV series ONLY)
- "dizi" alone → contentType: "tv"
- "diziler" → contentType: "tv"
- "film" alone → contentType: "movie"
- "filmler" → contentType: "movie"
- "dizi ve film" or "dizi, film" → contentType: "both"
- "film dizi" → contentType: "both"

ENGLISH:
- "TV series" or "series" or "show" → contentType: "tv"
- "movie" or "film" → contentType: "movie"
- "series and movie" or "show and movie" → contentType: "both"

FRENCH:
- "série télévisée" or "série" → contentType: "tv"
- "film" or "cinéma" → contentType: "movie"
- "série et film" → contentType: "both"

GERMAN:
- "Fernsehserie" or "Serie" → contentType: "tv"
- "Film" or "Kino" → contentType: "movie"
- "Serie und Film" → contentType: "both"

SPANISH:
- "serie de televisión" or "serie" → contentType: "tv"
- "película" or "film" → contentType: "movie"
- "serie y película" → contentType: "both"

CRITICAL RULE: "dizi film" in Turkish means TV SERIES ONLY, NOT both!

🎬🎬🎬 SCENE/DETAIL QUERY DETECTION (ULTRA HIGH PRIORITY) 🎬🎬🎬

CRITICAL: Detect when user describes a SPECIFIC SCENE, ACTION, or DETAIL from a movie/show!

SCENE DETAIL PATTERNS TO DETECT:

TURKISH ACTIONS:
- Selling/Trading: "satan", "sattığı", "satarken", "satar", "pazarlayan", "pazarladığı"
- Wearing/Clothing: "giyen", "giydiği", "giymiş", "giyinmiş", "giymekte"
- Running/Moving: "koşan", "koştuğu", "koşarken", "kaçan", "kaçarken"
- Dancing: "dans eden", "dans ettiği", "dans ederken"
- Singing: "şarkı söyleyen", "söylediği", "söylerken"
- Crying: "ağlayan", "ağladığı", "ağlarken"
- Fighting: "dövüşen", "kavga eden", "savaşan"
- Driving: "araba süren", "sürüyor", "sürerken"
- Saying/Speaking: "diye bağıran", "diye söyleyen", "dedi", "der"
- Other verbs: "oynayan", "oynadığı", "yapan", "yaptığı", "içen", "içtiği"

ENGLISH ACTIONS:
- "wearing", "wears", "dressed in", "puts on"
- "selling", "sells", "trades", "trading"
- "running", "runs", "chasing", "escaping"
- "dancing", "dances", "dancing to"
- "singing", "sings", "performs"
- "crying", "cries", "weeping"
- "fighting", "fights", "battling"
- "driving", "drives", "riding"
- "says", "said", "yells", "screams", "shouts"
- "playing", "plays", "acting", "doing"

SCENE DESCRIPTORS:
- Turkish: "sahnesi", "sahne", "sahnede"
- English: "scene where", "scene with", "in the scene", "movie where", "show where", "film where"
- French: "scène où", "dans la scène"
- German: "Szene wo", "in der Szene"
- Spanish: "escena donde", "en la escena"

DETECTION RULES:
1. If query contains [PERSON NAME] + [ACTION VERB] → isSceneDetailQuery: true
2. Examples:
   - "şener şenin domates sattığı film" → Person: "Şener Şen", Action: "selling tomatoes" → isSceneDetailQuery: true
   - "jim carrey wearing a mask" → Person: "Jim Carrey", Action: "wearing mask" → isSceneDetailQuery: true
   - "Tom Hanks running in the park" → Person: "Tom Hanks", Action: "running" → isSceneDetailQuery: true

WHEN isSceneDetailQuery IS TRUE:
- DO NOT use personName for person-based search (will return 80+ films!)
- DO NOT set personName field at all
- Set: isSceneDetailQuery: true
- Set: sceneDescription: "full description from user query"
- Set: specificTitle: null (will be filled by AI later)
- The AI will identify the exact movie/show title from the scene description

CRITICAL DIFFERENCE:
- "Şener Şen filmleri" → personName: "Şener Şen", isSceneDetailQuery: false (get all his films)
- "Şener Şen'in domates sattığı film" → isSceneDetailQuery: true, sceneDescription: "Şener Şen selling tomatoes" (get ONE specific film)

PERSON QUERY (HIGH PRIORITY):
When user asks ABOUT a person (not searching for their content):
- Keywords: "kim", "kimdir", "who is", "kaç yaşında", "how old", "doğum tarihi", "birthday", "nereli", "where from", "hakkında bilgi"
- Set: isPersonQuery: false (we want content search!), personName: "person name"
- Examples:
  * "Şener Şen'in oynadığı dizi film var mı?" → isPersonQuery: false, personName: "Şener Şen", contentType: "tv"
  * "Tom Hanks filmleri" → isPersonQuery: false, personName: "Tom Hanks", contentType: "movie"
  * "Brad Pitt'in dizileri" → isPersonQuery: false, personName: "Brad Pitt", contentType: "tv"

WHEN TO USE isPersonQuery: true:
- ONLY when asking for biographical information, NOT content search
- Examples: "Tom Hanks kaç yaşında?", "Brad Pitt kimdir?", "Şener Şen nereli?"

CONTENT INFO QUERY (HIGH PRIORITY):
When user asks ABOUT specific content (not searching):
- Keywords: "hakkında", "about", "ne zaman çıktı", "when released", "konusu", "plot", "yönetmen kim", "director", "oyuncular", "cast"
- Set: isContentInfoQuery: true, specificTitle: "title"
- Examples:
  * "Inception ne zaman çıktı?" → isContentInfoQuery: true, specificTitle: "Inception"
  * "Breaking Bad konusu" → isContentInfoQuery: true, specificTitle: "Breaking Bad"

TRENDING CONTENT:
Keywords: "trend", "trending", "popular", "popüler", "öne çıkan", "gündem", "hot", "viral"
→ Set: useTrendingAPI: true, sortBy: "popularity.desc", minRating: 0

SPECIFIC TITLE SEARCH (where to watch):
Keywords: "var mı", "is there", "where can I watch", "hangi platformda", "nerede izlenir"
→ Set: specificTitle: "title name", providers: [relevant IDs]

PRODUCTION COUNTRY:
- "türk filmi", "türk dizisi" → productionCountries: ["TR"], NO spokenLanguages
- "amerikan", "hollywood" → productionCountries: ["US"]
- "fransız", "french" → productionCountries: ["FR"]
- "japon", "anime" → productionCountries: ["JP"]
- "kore", "korean" → productionCountries: ["KR"]

⚠️ CRITICAL RULES FOR MAXIMUM RESULTS ⚠️

1. NEVER set spokenLanguages if productionCountries is set (redundant!)
2. NEVER add minRating unless user explicitly demands quality
3. Use SINGLE genre when possible (multiple genres = fewer results)
4. ALWAYS prefer popularity.desc over vote_average.desc
5. Limit total filters to MAX 3 (contentType + genre + provider, for example)
6. When user says simple things like "film öner", "dizi bul" → ONLY set contentType, nothing else!

⚠️ CONTENT SEARCH WITH PERSON NAME - EXAMPLES ⚠️

Turkish Examples:
- "Şener Şen'in oynadığı dizi film" → personName: "Şener Şen", contentType: "tv", isPersonQuery: false
- "Haluk Bilginer dizileri" → personName: "Haluk Bilginer", contentType: "tv", isPersonQuery: false
- "Kemal Sunal filmleri" → personName: "Kemal Sunal", contentType: "movie", isPersonQuery: false
- "Halit Ergenç dizi film" → personName: "Halit Ergenç", contentType: "tv", isPersonQuery: false

English Examples:
- "Tom Hanks movies" → personName: "Tom Hanks", contentType: "movie", isPersonQuery: false
- "Brad Pitt TV series" → personName: "Brad Pitt", contentType: "tv", isPersonQuery: false
- "shows with Jennifer Aniston" → personName: "Jennifer Aniston", contentType: "tv", isPersonQuery: false

French Examples:
- "films avec Jean Reno" → personName: "Jean Reno", contentType: "movie", isPersonQuery: false
- "séries avec Marion Cotillard" → personName: "Marion Cotillard", contentType: "tv", isPersonQuery: false

German Examples:
- "Filme mit Til Schweiger" → personName: "Til Schweiger", contentType: "movie", isPersonQuery: false
- "Serien mit Matthias Schweighöfer" → personName: "Matthias Schweighöfer", contentType: "tv", isPersonQuery: false

PRIORITY ORDER:
1. DETECT MOOD FIRST (explicit keywords, writing style, context)
2. Is this a SCENE/DETAIL query? → isSceneDetailQuery (CRITICAL: prevents 80+ film spam!)
3. Is this a PERSON info query? → isPersonQuery
4. Is this a CONTENT info query? → isContentInfoQuery
5. Is this EXPLICIT TRENDING request? → useTrendingAPI
6. Is this SPECIFIC TITLE search? → specificTitle
7. Is this completely VAGUE with NO mood and NO context? → isVagueQuery: true, useTrendingAPI: true
8. Otherwise → Extract filters, apply mood if detected, KEEP IT SIMPLE!

Respond ONLY with JSON:
{
  "isOffTopic": boolean,
  "detectedMood": "sad" | "happy" | "bored" | "excited" | "tired" | "relaxed" | "stressed" | "romantic" | "nostalgic" | "angry" | null,
  "moodConfidence": number (0-100) or null,
  "isVagueQuery": boolean,
  "isSceneDetailQuery": boolean,
  "sceneDescription": string or null,
  "isPersonQuery": boolean,
  "isContentInfoQuery": boolean,
  "contentType": "movie" | "tv" | "both",
  "genres": [genre_ids],
  "providers": [provider_ids],
  "minRating": number or 0,
  "maxRating": number or null,
  "yearStart": number or null,
  "yearEnd": number or null,
  "sortBy": "popularity.desc" | "vote_average.desc" | "release_date.desc",
  "personName": string or null,
  "personRole": "director" | "actor" | "any" | null,
  "directorName": string or null,
  "actorNames": [string array] or [],
  "keywords": [string array] or [],
  "locationKeywords": [string array] or [],
  "productionCountries": [country codes] or [],
  "spokenLanguages": [language codes] or [],
  "specificTitle": string or null,
  "maxResults": number or null,
  "maxSeasons": number or null,
  "minSeasons": number or null,
  "minRuntime": number or null,
  "maxRuntime": number or null,
  "certification": string or null,
  "withNetworks": [network_ids] or [],
  "adultContent": boolean,
  "useTrendingAPI": boolean
}`;
  try {
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory.slice(-6));
    }
    messages.push({
      role: "user",
      content: query
    });
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        response_format: {
          type: "json_object"
        },
        max_tokens: 500,
        temperature: 0.2
      })
    });
    if (!response.ok) {
      throw new Error("Failed to parse query");
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from GPT");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("GPT Error:", error);
    throw error;
  }
}
async function getPersonInfo(name, tmdbKey, language = "en-US") {
  try {
    console.log("🔍 Searching for person:", name);
    const personId = await findPersonId(name, tmdbKey);
    if (!personId) {
      console.log("❌ Person not found:", name);
      return null;
    }
    const url = `https://api.themoviedb.org/3/person/${personId}?api_key=${tmdbKey}&language=${language}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("✅ Person info retrieved:", data.name);
    return {
      id: data.id,
      name: data.name,
      biography: data.biography,
      birthday: data.birthday,
      place_of_birth: data.place_of_birth,
      known_for_department: data.known_for_department,
      profile_path: data.profile_path
    };
  } catch (error) {
    console.error("Error fetching person info:", error);
    return null;
  }
}
async function getContentInfo(title, contentType, tmdbKey, language = "en-US") {
  try {
    const searchTypes = contentType === "both" ? [
      "movie",
      "tv"
    ] : [
      contentType
    ];
    for (const type of searchTypes){
      const url = `https://api.themoviedb.org/3/search/${type}?api_key=${tmdbKey}&query=${encodeURIComponent(title)}&language=${language}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const detailUrl = `https://api.themoviedb.org/3/${type}/${item.id}?api_key=${tmdbKey}&language=${language}&append_to_response=credits`;
        const detailResponse = await fetch(detailUrl);
        const details = await detailResponse.json();
        const director = details.credits?.crew?.find((person)=>person.job === "Director")?.name;
        const cast = details.credits?.cast?.slice(0, 5).map((person)=>person.name) || [];
        const genres = details.genres?.map((g)=>g.name) || [];
        console.log("✅ Content info retrieved:", details.title || details.name);
        return {
          id: details.id,
          title: type === "movie" ? details.title : undefined,
          name: type === "tv" ? details.name : undefined,
          content_type: type === "movie" ? "movie" : "tv_show",
          overview: details.overview,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          vote_average: details.vote_average,
          release_date: details.release_date,
          first_air_date: details.first_air_date,
          runtime: details.runtime,
          number_of_seasons: details.number_of_seasons,
          director,
          cast,
          genres
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching content info:", error);
    return null;
  }
}
async function getRelatedContent(contentId, contentType, tmdbKey, language = "en-US") {
  try {
    const type = contentType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${contentId}/similar?api_key=${tmdbKey}&language=${language}&page=1`;
    const response = await fetch(url);
    const data = await response.json();
    const results = [];
    if (data.results && data.results.length > 0) {
      for (const item of data.results.slice(0, 10)){
        results.push({
          id: item.id,
          title: type === "movie" ? item.title : undefined,
          name: type === "tv" ? item.name : undefined,
          content_type: type === "movie" ? "movie" : "tv_show",
          overview: item.overview,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average,
          release_date: item.release_date,
          first_air_date: item.first_air_date,
          popularity: item.popularity
        });
      }
    }
    return results;
  } catch (error) {
    console.error("Error fetching related content:", error);
    return [];
  }
}
async function getContentProviders(contentId, contentType, tmdbKey, countryCode) {
  try {
    const type = contentType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${contentId}/watch/providers?api_key=${tmdbKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const countryData = data.results?.[countryCode];
    if (!countryData) {
      console.log(`⚠️ No providers found for ${contentId} in ${countryCode}`);
      return [];
    }
    const providerIds = [];
    if (countryData.flatrate) {
      providerIds.push(...countryData.flatrate.map((p)=>p.provider_id));
    }
    if (countryData.buy) {
      providerIds.push(...countryData.buy.map((p)=>p.provider_id));
    }
    if (countryData.rent) {
      providerIds.push(...countryData.rent.map((p)=>p.provider_id));
    }
    return [
      ...new Set(providerIds)
    ];
  } catch (error) {
    console.error("Error fetching providers:", error);
    return [];
  }
}
async function searchByTitle(title, contentType, tmdbKey, language = "en-US") {
  try {
    const results = [];
    const searchTypes = contentType === "both" ? [
      "movie",
      "tv"
    ] : [
      contentType
    ];
    for (const type of searchTypes){
      const url = `https://api.themoviedb.org/3/search/${type}?api_key=${tmdbKey}&query=${encodeURIComponent(title)}&language=${language}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        results.push({
          id: item.id,
          title: type === "movie" ? item.title : undefined,
          name: type === "tv" ? item.name : undefined,
          content_type: type === "movie" ? "movie" : "tv_show",
          overview: item.overview,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average,
          release_date: item.release_date,
          first_air_date: item.first_air_date,
          popularity: item.popularity
        });
        break;
      }
    }
    return results;
  } catch (error) {
    console.error("Title search error:", error);
    return [];
  }
}
async function findPersonId(name, tmdbKey) {
  try {
    const url = `https://api.themoviedb.org/3/search/person?api_key=${tmdbKey}&query=${encodeURIComponent(name)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      console.log(`✅ Found person: ${name} (ID: ${data.results[0].id})`);
      return data.results[0].id;
    }
    return null;
  } catch (error) {
    console.error("Person search error:", error);
    return null;
  }
}
async function findKeywordIds(keywords, tmdbKey) {
  const keywordIds = [];
  for (const keyword of keywords){
    try {
      const url = `https://api.themoviedb.org/3/search/keyword?api_key=${tmdbKey}&query=${encodeURIComponent(keyword)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        keywordIds.push(data.results[0].id);
        console.log(`✅ Found keyword: "${keyword}" (ID: ${data.results[0].id})`);
      }
    } catch (error) {
      console.error(`Error searching keyword "${keyword}":`, error);
    }
  }
  return keywordIds;
}
async function searchByPerson(personName, contentType, tmdbKey, personRole, language = "en-US") {
  try {
    const personId = await findPersonId(personName, tmdbKey);
    if (!personId) {
      console.log(`❌ Person not found: ${personName}`);
      return [];
    }
    const results = [];
    const searchTypes = contentType === "both" ? [
      "movie",
      "tv"
    ] : [
      contentType
    ];
    for (const type of searchTypes){
      const creditsType = type === "movie" ? "movie_credits" : "tv_credits";
      const url = `https://api.themoviedb.org/3/person/${personId}/${creditsType}?api_key=${tmdbKey}&language=${language}`;
      console.log(`🔍 Fetching ${type} credits for person ID: ${personId}`);
      const response = await fetch(url);
      const data = await response.json();
      let items = [];
      if (personRole === "director" && type === "movie") {
        items = data.crew?.filter((item)=>item.job === "Director") || [];
      } else if (personRole === "actor") {
        items = data.cast || [];
      } else {
        items = [
          ...data.cast || [],
          ...data.crew || []
        ];
      }
      const uniqueItems = Array.from(new Map(items.map((item)=>[
          item.id,
          item
        ])).values()).sort((a, b)=>(b.popularity || 0) - (a.popularity || 0));
      console.log(`✅ Found ${uniqueItems.length} ${type} credits`);
      for (const item of uniqueItems){
        results.push({
          id: item.id,
          title: type === "movie" ? item.title : undefined,
          name: type === "tv" ? item.name : undefined,
          content_type: type === "movie" ? "movie" : "tv_show",
          overview: item.overview,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average,
          release_date: item.release_date,
          first_air_date: item.first_air_date,
          popularity: item.popularity
        });
      }
    }
    return results;
  } catch (error) {
    console.error("Person search error:", error);
    return [];
  }
}
async function getTrendingContent(contentType, tmdbKey, countryCode, language = "en-US") {
  try {
    console.log("🔥 Fetching TRENDING content from TMDB API");
    const results = [];
    const timeWindow = "week";
    const mediaTypes = contentType === "both" ? [
      "movie",
      "tv"
    ] : [
      contentType === "movie" ? "movie" : "tv"
    ];
    for (const mediaType of mediaTypes){
      const url = `https://api.themoviedb.org/3/trending/${mediaType}/${timeWindow}?api_key=${tmdbKey}&language=${language}`;
      console.log(`🔍 Trending URL: ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      console.log(`📦 Found ${data.results?.length || 0} trending ${mediaType} results`);
      if (data.results && data.results.length > 0) {
        for (const item of data.results){
          results.push({
            id: item.id,
            title: mediaType === "movie" ? item.title : undefined,
            name: mediaType === "tv" ? item.name : undefined,
            content_type: mediaType === "movie" ? "movie" : "tv_show",
            overview: item.overview,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: item.vote_average,
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            popularity: item.popularity
          });
        }
      }
    }
    console.log(`✅ Total trending results: ${results.length}`);
    return results.sort((a, b)=>(b.popularity || 0) - (a.popularity || 0));
  } catch (error) {
    console.error("Error fetching trending content:", error);
    return [];
  }
}
function validateAndRelaxParams(params) {
  const relaxedParams = {
    ...params
  };
  const filterCount = [
    params.genres && params.genres.length > 0,
    params.providers && params.providers.length > 0,
    params.minRating && params.minRating > 0,
    params.productionCountries && params.productionCountries.length > 0,
    params.spokenLanguages && params.spokenLanguages.length > 0,
    params.yearStart !== null || params.yearEnd !== null,
    params.keywords && params.keywords.length > 0
  ].filter(Boolean).length;
  console.log(`📊 Filter count: ${filterCount}`);
  if (filterCount > 3) {
    console.log("⚠️ Too many filters detected, relaxing parameters...");
    if (relaxedParams.productionCountries && relaxedParams.productionCountries.length > 0) {
      console.log("📉 Removing spokenLanguages (redundant with productionCountries)");
      relaxedParams.spokenLanguages = [];
    }
    if (relaxedParams.minRating && relaxedParams.minRating < 7.0) {
      console.log(`📉 Removing minRating ${relaxedParams.minRating} (keeping search broad)`);
      relaxedParams.minRating = 0;
    }
    if (relaxedParams.genres && relaxedParams.genres.length > 2) {
      console.log(`📉 Reducing genres from ${relaxedParams.genres.length} to 2`);
      relaxedParams.genres = relaxedParams.genres.slice(0, 2);
    }
    if (relaxedParams.keywords && relaxedParams.keywords.length > 0) {
      console.log("📉 Removing keywords");
      relaxedParams.keywords = [];
      relaxedParams.locationKeywords = [];
    }
  }
  if (relaxedParams.productionCountries && relaxedParams.productionCountries.length > 0 && relaxedParams.spokenLanguages && relaxedParams.spokenLanguages.length > 0) {
    console.log("🔧 Auto-removing spokenLanguages (productionCountries is sufficient)");
    relaxedParams.spokenLanguages = [];
  }
  return relaxedParams;
}
async function searchTMDB(params, tmdbKey, countryCode, language = "en-US") {
  params = validateAndRelaxParams(params);
  let results = [];
  if (params.useTrendingAPI) {
    console.log("🔥 Using TRENDING API");
    const trendingResults = await getTrendingContent(params.contentType, tmdbKey, countryCode, language);
    let filteredResults = trendingResults;
    if (params.providers && params.providers.length > 0) {
      console.log("🔍 Filtering trending by providers:", params.providers);
      const filtered = [];
      for (const item of trendingResults){
        const providers = await getContentProviders(item.id, item.content_type, tmdbKey, countryCode);
        const hasProvider = params.providers.some((providerId)=>providers.includes(providerId));
        if (hasProvider) {
          filtered.push(item);
        }
      }
      filteredResults = filtered;
    }
    if (params.genres && params.genres.length > 0) {
      console.log("🔍 Note: Genre filtering on trending not fully supported");
    }
    return filteredResults.slice(0, params.maxResults || 50);
  }
  if (params.specificTitle) {
    const titleResults = await searchByTitle(params.specificTitle, params.contentType, tmdbKey, language);
    if (params.providers && params.providers.length > 0 && titleResults.length > 0) {
      const filteredResults = [];
      for (const item of titleResults){
        const providers = await getContentProviders(item.id, item.content_type, tmdbKey, countryCode);
        const hasProvider = params.providers.some((providerId)=>providers.includes(providerId));
        if (hasProvider) {
          filteredResults.push(item);
        } else {
          console.log(`⚠️ ${item.title || item.name} not available on requested provider(s)`);
        }
      }
      return filteredResults;
    }
    return titleResults;
  }
  if (params.isPersonQuery && params.personName) {
    return await searchByPerson(params.personName, params.contentType || "both", tmdbKey, params.personRole, language);
  }
  if (params.personName && !params.directorName && (!params.actorNames || params.actorNames.length === 0)) {
    return await searchByPerson(params.personName, params.contentType, tmdbKey, params.personRole, language);
  }
  const contentTypes = params.contentType === "both" ? [
    "movie",
    "tv"
  ] : [
    params.contentType
  ];
  let keywordIds = [];
  if (params.keywords && params.keywords.length > 0) {
    keywordIds = await findKeywordIds(params.keywords, tmdbKey);
  }
  if (params.locationKeywords && params.locationKeywords.length > 0) {
    const locationIds = await findKeywordIds(params.locationKeywords, tmdbKey);
    keywordIds = [
      ...keywordIds,
      ...locationIds
    ];
  }
  let directorId = null;
  let actorIds = [];
  if (params.directorName) {
    directorId = await findPersonId(params.directorName, tmdbKey);
    if (directorId) {
      console.log(`🎬 Director ID found: ${params.directorName} (${directorId})`);
    }
  }
  if (params.actorNames && params.actorNames.length > 0) {
    for (const actorName of params.actorNames){
      const actorId = await findPersonId(actorName, tmdbKey);
      if (actorId) {
        actorIds.push(actorId);
        console.log(`🎭 Actor ID found: ${actorName} (${actorId})`);
      }
    }
  }
  for (const type of contentTypes){
    try {
      const baseUrl = `https://api.themoviedb.org/3/discover/${type}`;
      const urlParams = new URLSearchParams({
        api_key: tmdbKey,
        language: language,
        sort_by: params.sortBy || "popularity.desc",
        page: "1"
      });
      if (params.minRating && params.minRating >= 8) {
        urlParams.append("vote_count.gte", "20");
      } else if (params.minRating && params.minRating >= 7) {
        urlParams.append("vote_count.gte", "10");
      } else if (params.minRating && params.minRating >= 6) {
        urlParams.append("vote_count.gte", "5");
      } else {
        urlParams.append("vote_count.gte", "3");
      }
      if (params.genres && params.genres.length > 0) {
        urlParams.append("with_genres", params.genres.join(","));
      }
      if (params.providers && params.providers.length > 0) {
        urlParams.append("with_watch_providers", params.providers.join("|"));
        urlParams.append("watch_region", countryCode);
      }
      if (params.minRating && params.minRating > 0) {
        urlParams.append("vote_average.gte", params.minRating.toString());
      }
      if (params.maxRating && params.maxRating < 10) {
        urlParams.append("vote_average.lte", params.maxRating.toString());
      }
      if (params.yearStart !== null || params.yearEnd !== null) {
        const now = new Date();
        const currentYear = now.getFullYear();
        if (params.yearStart !== null) {
          if (type === "movie") {
            urlParams.append("primary_release_date.gte", `${params.yearStart}-01-01`);
          } else {
            urlParams.append("first_air_date.gte", `${params.yearStart}-01-01`);
          }
        }
        if (params.yearEnd !== null) {
          const endDate = params.yearEnd >= currentYear ? now.toISOString().split("T")[0] : `${params.yearEnd}-12-31`;
          if (type === "movie") {
            urlParams.append("primary_release_date.lte", endDate);
          } else {
            urlParams.append("first_air_date.lte", endDate);
          }
        }
      }
      if (keywordIds.length > 0) {
        urlParams.append("with_keywords", keywordIds.join(","));
      }
      if (params.productionCountries && params.productionCountries.length > 0) {
        urlParams.append("with_origin_country", params.productionCountries.join("|"));
      }
      if (params.spokenLanguages && params.spokenLanguages.length > 0) {
        urlParams.append("with_original_language", params.spokenLanguages.join("|"));
      }
      if (type === "movie" && directorId) {
        urlParams.append("with_crew", directorId.toString());
      }
      if (actorIds.length > 0) {
        urlParams.append("with_cast", actorIds.join(","));
      }
      if (type === "tv") {
        if (params.maxSeasons && params.maxSeasons > 0) {
          urlParams.append("with_number_of_seasons.lte", params.maxSeasons.toString());
        }
        if (params.minSeasons && params.minSeasons > 0) {
          urlParams.append("with_number_of_seasons.gte", params.minSeasons.toString());
        }
        if (params.withNetworks && params.withNetworks.length > 0) {
          urlParams.append("with_networks", params.withNetworks.join("|"));
        }
      }
      if (type === "movie") {
        if (params.minRuntime && params.minRuntime > 0) {
          urlParams.append("with_runtime.gte", params.minRuntime.toString());
        }
        if (params.maxRuntime && params.maxRuntime > 0) {
          urlParams.append("with_runtime.lte", params.maxRuntime.toString());
        }
      }
      if (params.certification) {
        urlParams.append("certification_country", countryCode);
        urlParams.append("certification", params.certification);
      }
      if (!params.adultContent) {
        urlParams.append("include_adult", "false");
      }
      const url = `${baseUrl}?${urlParams.toString()}`;
      console.log(`🔍 TMDB URL: ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      console.log(`📦 Page 1: Found ${data.results?.length || 0} results for ${type}`);
      if (data.results && data.results.length > 0) {
        for (const item of data.results){
          results.push({
            id: item.id,
            title: type === "movie" ? item.title : undefined,
            name: type === "tv" ? item.name : undefined,
            content_type: type === "movie" ? "movie" : "tv_show",
            overview: item.overview,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: item.vote_average,
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            popularity: item.popularity
          });
        }
      }
      if (data.total_pages > 1 && results.length < 100) {
        const pagesToFetch = Math.min(5, data.total_pages);
        for(let page = 2; page <= pagesToFetch; page++){
          try {
            urlParams.set("page", page.toString());
            const pageUrl = `${baseUrl}?${urlParams.toString()}`;
            const pageResponse = await fetch(pageUrl);
            const pageData = await pageResponse.json();
            if (pageData.results && pageData.results.length > 0) {
              for (const item of pageData.results){
                results.push({
                  id: item.id,
                  title: type === "movie" ? item.title : undefined,
                  name: type === "tv" ? item.name : undefined,
                  content_type: type === "movie" ? "movie" : "tv_show",
                  overview: item.overview,
                  poster_path: item.poster_path,
                  backdrop_path: item.backdrop_path,
                  vote_average: item.vote_average,
                  release_date: item.release_date,
                  first_air_date: item.first_air_date,
                  popularity: item.popularity
                });
              }
            }
            await new Promise((resolve)=>setTimeout(resolve, 100));
          } catch (pageError) {
            console.error(`Error fetching page ${page}:`, pageError);
          }
        }
      }
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
    }
  }
  console.log(`✅ Total results: ${results.length}`);
  if (results.length < 5) {
    console.log(`⚠️ Only ${results.length} results found, trying aggressive fallback...`);
    const fallbackParams = {
      ...params
    };
    if (params.minRating && params.minRating > 0) {
      console.log(`📉 FALLBACK 1: Removing minRating ${params.minRating} entirely`);
      fallbackParams.minRating = 0;
      const fallbackResults = await searchTMDB(fallbackParams, tmdbKey, countryCode, language);
      if (fallbackResults.length >= 5) {
        console.log(`✅ Fallback 1 succeeded: ${fallbackResults.length} results`);
        return fallbackResults;
      }
    }
    if (params.keywords && params.keywords.length > 0) {
      console.log("📉 FALLBACK 2: Removing keywords");
      fallbackParams.keywords = [];
      fallbackParams.locationKeywords = [];
      const fallbackResults = await searchTMDB(fallbackParams, tmdbKey, countryCode, language);
      if (fallbackResults.length >= 5) {
        console.log(`✅ Fallback 2 succeeded: ${fallbackResults.length} results`);
        return fallbackResults;
      }
    }
    if (params.genres && params.genres.length > 1) {
      console.log(`📉 FALLBACK 3: Reducing genres to just ${params.genres[0]}`);
      fallbackParams.genres = [
        params.genres[0]
      ];
      const fallbackResults = await searchTMDB(fallbackParams, tmdbKey, countryCode, language);
      if (fallbackResults.length >= 5) {
        console.log(`✅ Fallback 3 succeeded: ${fallbackResults.length} results`);
        return fallbackResults;
      }
    }
    if (params.providers && params.providers.length > 0) {
      console.log("📉 FALLBACK 4: Removing provider filter");
      fallbackParams.providers = [];
      const fallbackResults = await searchTMDB(fallbackParams, tmdbKey, countryCode, language);
      if (fallbackResults.length >= 5) {
        console.log(`✅ Fallback 4 succeeded: ${fallbackResults.length} results`);
        return fallbackResults;
      }
    }
    if (params.yearStart !== null || params.yearEnd !== null) {
      console.log("📉 FALLBACK 5: Removing year range");
      fallbackParams.yearStart = null;
      fallbackParams.yearEnd = null;
      const fallbackResults = await searchTMDB(fallbackParams, tmdbKey, countryCode, language);
      if (fallbackResults.length >= 5) {
        console.log(`✅ Fallback 5 succeeded: ${fallbackResults.length} results`);
        return fallbackResults;
      }
    }
    if (params.productionCountries && params.productionCountries.length > 0) {
      console.log("📉 FALLBACK 6: Simplifying to ONLY production country + popularity");
      fallbackParams.minRating = 0;
      fallbackParams.genres = [];
      fallbackParams.providers = [];
      fallbackParams.spokenLanguages = [];
      fallbackParams.yearStart = null;
      fallbackParams.yearEnd = null;
      fallbackParams.keywords = [];
      fallbackParams.locationKeywords = [];
      fallbackParams.sortBy = "popularity.desc";
      const fallbackResults = await searchTMDB(fallbackParams, tmdbKey, countryCode, language);
      if (fallbackResults.length >= 5) {
        console.log(`✅ Fallback 6 succeeded: ${fallbackResults.length} results`);
        return fallbackResults;
      }
    }
    if (results.length < 3) {
      console.log("📉 FALLBACK 7: ULTIMATE - Just contentType + popularity");
      const ultimateParams = {
        contentType: params.contentType || "both",
        sortBy: "popularity.desc",
        minRating: 0,
        genres: [],
        providers: [],
        productionCountries: [],
        spokenLanguages: [],
        yearStart: null,
        yearEnd: null
      };
      const ultimateResults = await searchTMDB(ultimateParams, tmdbKey, countryCode, language);
      if (ultimateResults.length > results.length) {
        console.log(`✅ Ultimate fallback: ${ultimateResults.length} results`);
        return ultimateResults;
      }
    }
  }
  if (params.maxResults && params.maxResults > 0) {
    return results.slice(0, params.maxResults);
  }
  return results;
}
function getProviderName(providerId) {
  const map = {
    8: "Netflix",
    9: "Amazon Prime",
    337: "Disney+",
    1899: "HBO Max",
    15: "Hulu",
    350: "Apple TV+",
    531: "Paramount+"
  };
  return map[providerId] || "the platform";
}
