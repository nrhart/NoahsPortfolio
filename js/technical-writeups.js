/* One catalog shared by project buttons and the writeups collection. Paths are site-relative. */
(() => {
  const siteRoot = new URL('../', document.currentScript.src);
  const catalog = [
    { project: 'NO RAIL', projectURL: 'projects/unreal.html#no-rail', systemsAnchor: 'no-rail-systems', systems: [
  {
    "title": "Procedural Train Generation System",
    "paragraphs": [
      "I implemented modular train assembly in AEncounterManager using Unreal Engine 5 level-instance streaming. The current C++ implementation creates a five-car sequence: three connector cars surrounding two encounter cars, selected independently from two designer-configured layout pools. This combines a predictable progression structure with variation in authored environments."
    ],
    "sections": [
      {
        "title": "Architecture & Content Configuration",
        "paragraphs": [
          "Pool1Layouts and Pool2Layouts store TSoftObjectPtr<UWorld> references, while ConnectorCarLevel supplies the shared connector environment. SelectedTrainLevels records build order; ActiveTrainCars retains the corresponding ULevelStreamingDynamic instances. Level content remains separate from the assembly code, so designers can extend either pool without rewriting the construction loop.",
          "Each pool uses FMath::RandRange for uniform selection. The structural order is fixed; variation comes from the selected environments rather than an arbitrary number or ordering of cars."
        ]
      },
      {
        "title": "Streaming & Placement Lifecycle",
        "items": [
          "StartTrainPhase validates the connector and both pools, creates the five-entry sequence, and initializes CurrentBuildLocation from TrainStartPoint or the world origin.",
          "StreamCarAtIndex requests the next environment through LoadLevelInstanceBySoftObjectPtr, retains the returned instance, and requests loading and visibility.",
          "WaitForStreamedLevelReady checks both loaded-level availability and visibility using 0.1-second timer retries, with a maximum of 80 attempts.",
          "OnCarStreamed finds a SnapPointClass actor belonging to that exact loaded ULevel. Its position becomes the next car origin; missing snap points use a 4,000 cm offset along X.",
          "The manager opens the entrance door, registers the car’s enemy spawners, advances BuildCarIndex, and streams the next car. OnTrainBuiltComplete is currently a logging extension point."
        ],
        "ordered": true
      },
      {
        "title": "Instance Ownership & Engineering Decisions",
        "paragraphs": [
          "I scope discovery to each streamed ULevel rather than relying only on asset names or world-wide tags. This matters when the same connector asset is instantiated repeatedly: its doors, snap points, and spawners must belong to the correct instance.",
          "LevelSpawners maps weak ULevelStreamingDynamic keys to FLevelSpawnerList entries containing weak AEnemySpawner references. RegisterSpawnersForLevel filters tagged actors by their actual level, giving encounter actors an instance-specific spawner lookup."
        ],
        "details": {
          "summary": "Source references & lifecycle boundaries",
          "paragraphs": [
            "Verified in EncounterManager.h and EncounterManager.cpp. StartTrainPhase resets tracking arrays but does not explicitly unload previous level instances in this path. The readiness timeout logs and attempts OnCarStreamed; it does not guarantee recovery when a loaded level is unavailable."
          ]
        }
      }
    ],
    "media": {
      "architecture": [],
      "streaming-implementation": [
        {
          "type": "code",
          "code": "SelectedTrainLevels.Add(ConnectorCarLevel);\n\n    const int32 Pool1Idx = FMath::RandRange(0, Pool1Layouts.Num() - 1);\n    SelectedTrainLevels.Add(Pool1Layouts[Pool1Idx]);\n\n    SelectedTrainLevels.Add(ConnectorCarLevel);\n\n    const int32 Pool2Idx = FMath::RandRange(0, Pool2Layouts.Num() - 1);\n    SelectedTrainLevels.Add(Pool2Layouts[Pool2Idx]);\n\n    SelectedTrainLevels.Add(ConnectorCarLevel);",
          "caption": "Source excerpt — AEncounterManager::StartTrainPhase, EncounterManager.cpp. Fixed connector order with uniform selection from two layout pools."
        }
      ],
      "generated-configurations": [],
      "gameplay": []
    }
  },
  {
    "title": "Dynamic Encounter & Objective System",
    "paragraphs": [
      "I separated encounter orchestration from objective-specific behavior using AEncounterManager and the Blueprint-compatible IEncounterInterface. The manager creates the configured encounter actor inside the selected train-car level, while each objective owns its gameplay conditions, UI, and completion handling."
    ],
    "sections": [
      {
        "title": "Architecture & Activation",
        "paragraphs": [
          "EEncounterType selects SpawnWave, CaptureZone, DefendTower, or Tutorial. The manager exposes separate encounter class references, allowing Blueprint subclasses to supply content while C++ handles dispatch. IEncounterInterface defines StartEncounter, CompleteEncounter, and IsCompleted as BlueprintNativeEvent functions.",
          "AEncounterTerminal provides the verified C++ activation path. It checks interaction range and player identity, guards against repeated activation, calls StartEncounterByType with its own GetLevel(), and disables its trigger collision."
        ]
      },
      {
        "title": "Encounter Lifecycle",
        "items": [
          "StartEncounterByType resolves the terminal’s ULevel to its streamed instance and selects the class configured for EEncounterType.",
          "SpawnActor uses OverrideLevel to place the encounter actor in the target car; SetOwningLevel gives supported objective classes access to that same instance.",
          "The manager records the actor, connects the spawn-wave exit trigger where applicable, and invokes Execute_StartEncounter through IEncounterInterface.",
          "The objective locates its scoped spawners or target actors, initializes its UI and state, and evaluates its own completion conditions.",
          "OnEncounterCompleted stops encounter music, opens the same-level TrainDoor_Exit through its OpenDoor function, and records whether the last encounter car completed.",
          "OnBuffSelected opens the connector progression door or the station door, depending on the last-encounter state."
        ],
        "ordered": true
      },
      {
        "title": "Objective Implementations",
        "items": [
          "ASpawnWaveEncounter implements timed survival. Before SurviveDuration expires, OnWaveFinished can start another wave; expiry opens the exit, and leaving through the exit completes the encounter. Cleanup stops scoped spawning, unbinds callbacks, removes enemies and timer UI, and notifies the manager.",
          "AKillEnemiesEncounter, used for the tutorial configuration, checks both spawner completion and GetEnemiesAlive() == 0 before opening the tutorial exit.",
          "ACaptureZoneEncounter increases CaptureProgress while the player occupies the zone and decays it outside, normalized by CaptureTime and clamped from zero to one. Full progress stops scoped spawning, removes its widget, and notifies the manager.",
          "ADefendTowerEncounter binds spawner completion and objective-destruction delegates. Success requires finished spawners and no surviving encounter enemies; objective destruction triggers failure handling."
        ]
      },
      {
        "title": "Designer Configuration & Engineering Decisions",
        "paragraphs": [
          "Spawn-wave and defend-tower encounters resolve per-level wave-row overrides with a default fallback. This keeps encounter behavior reusable while authored cars provide their own wave configuration. Dynamic OnWaveFinished bindings connect spawning to objective progression, with explicit unbinding in the completion paths.",
          "The shared interface and level-scoped actor ownership let new objective behavior fit the existing orchestration without merging every completion rule into the generator."
        ],
        "details": {
          "summary": "Source references & design scope",
          "paragraphs": [
            "Verified in EncounterManager, EncounterTerminal, EncounterInterface, SpawnWaveEncounter, KillEnemiesEncounter, CaptureZoneEncounter, and DefendTowerEncounter headers and sources. The current native implementation uses two uniformly selected layout pools; a weighted Encounters / Modifiers / Challenges model is not implemented in the reviewed C++ and is not presented here as shipped behavior. BP_EncounterStartTrigger exists as an asset reference, but its graph was not inspected. The separate ASurviveEncounter contains unfinished timer logic; timed survival described above is implemented by ASpawnWaveEncounter."
          ]
        }
      }
    ],
    "media": {
      "architecture": [],
      "configuration-selection": [],
      "encounter-lifecycle": [],
      "objective-implementation": [],
      "gameplay": []
    }
  },
  {
    "title": "Station Management & Puzzle Progression System",
    "paragraphs": [
      "I implemented station-phase orchestration in ATrainStationManager, separating the station’s time limit and return-to-train rules from individual Blueprint puzzle mechanics. Native code manages the travel lifecycle and exposes events for presentation; puzzle assets and game-instance state support the station’s interactive content."
    ],
    "sections": [
      {
        "title": "Station Architecture",
        "paragraphs": [
          "ATrainStationManager owns the active phase, departure state, remaining station time, and re-entry lockout. BlueprintAssignable events OnStationTimerUpdated, OnTrainDeparted, and OnStationPhaseEnded expose changes without embedding UI behavior in the manager. BP_HandleDepartureDeath is a BlueprintImplementableEvent for departure-related death handling.",
          "ATrainReturnDoor delegates interaction to TryReturnToTrain. CanEnterTrain exposes the same eligibility rules to Blueprints: an active phase, a train that has not departed, and an expired lockout."
        ]
      },
      {
        "title": "Station Lifecycle",
        "items": [
          "BeginPlay calls StartStationPhase, initializes the station and lockout clocks, and starts a repeating 0.25-second timer.",
          "Timer updates decrement and clamp the clocks and broadcast their current values for Blueprint listeners.",
          "TryReturnToTrain checks phase state, the pawn, departure, and the lockout before ending the phase with a return request.",
          "When station time expires, a one-time departure guard stops the clock, disables return eligibility, broadcasts departure, and enables the game mode’s station-departure respawn state.",
          "A delayed callback invokes BP_HandleDepartureDeath. A successful return clears phase timers and travels through OpenLevel using TrainLevelName."
        ],
        "ordered": true
      },
      {
        "title": "Puzzle Assets & State Ownership",
        "paragraphs": [
          "The station content includes separate Blueprint puzzle actors rather than a native central registry of completed puzzles. BP_PathPuzzleManager references BP_PathDigit and BP_KeypadDoor and contains a GenerateFullPuzzle identifier. BP_LightOutPuzzle exposes CheckPuzzleSolved and PuzzleSolved identifiers; BP_PuzzleLever references the puzzle and LeverIndex. Keypad and puzzle-door assets provide additional interaction components.",
          "BP_DroneTarget and BP_LootBoxDronePuzzle reference PuzzleTargetCount on UNoRailGameInstance. That Blueprint-accessible integer lives beyond a single level instance, giving puzzle content a shared counter with game-instance lifetime. The game instance also exposes SavedPersistentTags and methods to add, remove, clear, and restore gameplay tags to an ability system component."
        ]
      },
      {
        "title": "Engineering Decisions & Persistence Boundaries",
        "paragraphs": [
          "The native phase manager provides a clear boundary for station timing and travel, while individual puzzle assets retain their interaction-specific state. Delegates and Blueprint events allow presentation and content behavior to respond to the phase without coupling every puzzle to timer implementation details.",
          "PuzzleTargetCount has application-session lifetime through UNoRailGameInstance. This is distinct from saving to disk or restoring every completed puzzle after travel; the reviewed native code does not establish either mechanism."
        ],
        "details": {
          "summary": "Source references & Blueprint inspection scope",
          "paragraphs": [
            "Verified native behavior comes from TrainStationManager.h/.cpp, TrainReturnDoor.h/.cpp, and NoRailGameInstance.h/.cpp. Puzzle names and references were read from existing Blueprint asset name tables, not exported executable graphs. They establish available assets and referenced state, but not exact node wiring, completion propagation, or cross-level restoration. ATrainStationManager does not contain a native puzzle-completion registry in this checkout."
          ]
        }
      }
    ],
    "media": {
      "architecture": [],
      "puzzle-completion-flow": [],
      "progress-tracking": [],
      "puzzle-examples": [],
      "gameplay": []
    }
  }
], documents: [
      { title: 'NO RAIL — System and Level Design Master Document', file: 'NORAIL System and Level Design Master Doc.pdf' }
    ] },
    { project: 'AI Movement', projectURL: 'projects/ai.html#ai-movement', category: 'AI Projects', documents: [
      { title: 'AI Movement — Process Letter', file: 'Process Letter AI Movement.pdf' }
    ] },
    { project: 'Pathfinding', projectURL: 'projects/ai.html#pathfinding', category: 'AI Projects', documents: [
      { title: 'Pathfinding — Process Letter', file: 'Process Letter Pathfinding.pdf' }
    ] },
    { project: 'Decision Making', projectURL: 'projects/ai.html#decision-making', category: 'AI Projects', documents: [
      { title: 'Decision Making — Process Letter', file: 'Process Letter Decision-Making.pdf' }
    ] },
    { project: 'Rockin Derby', projectURL: 'projects/unity.html#rockin-derby', listOnCard: true, documents: [
      { title: 'Controller Documentation', file: 'Rockin Derby Controller Doc.pdf' },
      { title: 'Prototype — Dev Diary', file: 'Alt Control Prototype Dev Diary.pdf' },
      { title: 'Sprint 1 — Dev Diary', file: 'Alt Control Sprint 1 Dev Diary.pdf' },
      { title: 'Sprint 2 — Dev Diary', file: 'Alt Control Sprint 2 Dev Diary.pdf' },
      { title: 'Sprint 3 — Dev Diary', file: 'Alt Control Sprint 3 Dev Diary.pdf' },
      { title: 'Sprint 4 — Dev Diary', file: 'Alt Control Sprint 4 Dev Diary.pdf' }
    ] },
    { project: 'Graphics Engine Development', projectURL: 'projects/custom-engine.html#graphics-engine', documents: [
      { title: 'Flappy Squirrel — Final Project Write-Up', file: 'finalprojectwriteup.pdf' },
      { title: 'Engine Audio, Collision, and Physics Systems', file: 'enginesystemwriteup.pdf' }
    ] },
    { project: 'Castle of Cardboard', projectURL: 'projects/unreal.html#castle-of-cardboard', listOnCard: true, documents: [
      { title: 'Enemy Technical Documentation', file: 'CoC Enemy Tech Doc.pdf' },
      { title: 'Development Diary', file: 'Castle of Cardboard DEV Diary.pdf' }
    ] },
    { project: 'Squirrel Souls', projectURL: 'projects/unreal.html#squirrel-souls', documents: [
      { title: 'State Pattern Code Analysis', file: 'SquirrelSoulsAnalysisState.pdf' },
      { title: 'Type Object Pattern Code Analysis', file: 'SquirrelSoulAnalysisTpyeObject.pdf' },
      { title: 'Behavior Tree Code Analysis', file: 'SquirrelSoulAnalysisBT.pdf' }
    ] },
    { project: 'Pet Fish Simulator', projectURL: 'projects/unreal.html#pet-fish-simulator', documents: [
      { title: 'Procedural Generation Code Analysis', file: 'Code Analysis Pet Fish.pdf' }
    ] },
    { project: 'Tetris', projectURL: 'projects/unity.html#tetris', documents: [
      { title: 'Tetris Architecture Code Analysis', file: 'Tetris Code Analysis.pdf' },
      { title: 'Command Pattern and Undo/Redo Analysis', file: 'Tetris with Command pattern Code Analysis .pdf' }
    ] },
    { project: 'Weapon Wheel & Gadget System', projectURL: 'projects/unreal.html#weapon-wheel', documents: [
      { title: 'Weapon Wheel Code Analysis', file: 'Code Analysis Weapon Wheel.pdf' }
    ] }
  ];
  const pdfURL = doc => new URL(`pdfs/${encodeURIComponent(doc.file)}`, siteRoot).href;
  const element = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  };
  const documentationParagraph = text => {
    const paragraph = element('p');
    const identifiers = /\b(?:[AIUEF][A-Z][A-Za-z0-9_]+|BP_[A-Za-z0-9_]+|LoadLevelInstanceBySoftObjectPtr|StartTrainPhase|StreamCarAtIndex|WaitForStreamedLevelReady|OnCarStreamed|RegisterSpawnersForLevel|StartEncounterByType|SetOwningLevel|Execute_StartEncounter|OnEncounterCompleted|OnBuffSelected|TryReturnToTrain|CanEnterTrain|StartStationPhase|PuzzleTargetCount|CheckPuzzleSolved|GenerateFullPuzzle)\b/g;
    let offset = 0;
    for (const match of text.matchAll(identifiers)) {
      paragraph.append(document.createTextNode(text.slice(offset, match.index)), element('code', '', match[0]));
      offset = match.index + match[0].length;
    }
    paragraph.append(document.createTextNode(text.slice(offset)));
    return paragraph;
  };
  // Media definitions stay empty until real assets are supplied. Each slot accepts
  // {type: 'image'|'diagram'|'video', src, alt, caption} or {type:'code', code, caption}.
  const documentationMedia = (entries, slot) => {
    const container = element('div', 'technical-media');
    container.dataset.mediaSlot = slot;
    container.hidden = !entries.length;
    entries.forEach(entry => {
      const figure = element('figure');
      if (entry.type === 'image' || entry.type === 'diagram') {
        const image = element('img');
        image.src = new URL(entry.src, siteRoot).href;
        image.alt = entry.alt || entry.caption || '';
        image.loading = 'lazy';
        const link = element('a');
        link.href = image.src; link.target = '_blank'; link.rel = 'noopener';
        link.append(image); figure.append(link);
      } else if (entry.type === 'video') {
        const video = element('video');
        video.src = new URL(entry.src, siteRoot).href;
        video.controls = true; video.playsInline = true; video.preload = 'metadata';
        if (entry.poster) video.poster = new URL(entry.poster, siteRoot).href;
        video.setAttribute('aria-label', entry.caption || 'Gameplay demonstration');
        figure.append(video);
      } else if (entry.type === 'code') {
        const pre = element('pre');
        const code = element('code', 'technical-code');
        const tokens = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|\b(?:class|struct|public|private|protected|virtual|override|const|void|bool|int|float|auto|if|else|for|while|return|nullptr|true|false)\b|\b\d+(?:\.\d+)?\b/g;
        let offset = 0;
        for (const match of entry.code.matchAll(tokens)) {
          code.append(document.createTextNode(entry.code.slice(offset, match.index)));
          const token = match[0];
          const kind = token.startsWith('/') ? 'comment' : token.startsWith('"') ? 'string' : /^\d/.test(token) ? 'number' : 'keyword';
          code.append(element('span', `syntax-${kind}`, token));
          offset = match.index + token.length;
        }
        code.append(document.createTextNode(entry.code.slice(offset)));
        pre.append(code); figure.append(pre);
      }
      if (entry.caption) figure.append(element('figcaption', '', entry.caption));
      if (figure.childNodes.length) container.append(figure);
    });
    return container;
  };
  const systemArticle = (system, className) => {
    const article = element('article', className);
    article.append(element('h3', '', system.title));
    system.paragraphs.forEach(text => article.append(documentationParagraph(text)));
    let content = article;
    if (className === 'project-system-breakdown' && system.sections?.length) {
      const details = element('details', 'system-details');
      details.append(element('summary', '', 'Architecture, lifecycle & engineering decisions'));
      article.append(details);
      content = details;
    }
    (system.sections || []).forEach(section => {
      const block = element('div', 'system-documentation-section');
      block.append(element('h4', '', section.title));
      (section.paragraphs || []).forEach(text => block.append(documentationParagraph(text)));
      if (section.items?.length) {
        const list = element(section.ordered ? 'ol' : 'ul', 'system-documentation-list');
        section.items.forEach(text => list.append(element('li', '', text)));
        block.append(list);
      }
      if (section.details) {
        const details = element('details', 'system-details implementation-scope');
        details.append(element('summary', '', section.details.summary));
        section.details.paragraphs.forEach(text => details.append(documentationParagraph(text)));
        block.append(details);
      }
      content.append(block);
    });
    Object.entries(system.media || {}).forEach(([slot, entries]) => content.append(documentationMedia(entries, slot)));
    return article;
  };
  const pdfLink = (doc, text, download = false) => {
    const link = element('a', 'btn btn-ghost', text);
    link.href = pdfURL(doc);
    if (download) link.download = doc.file;
    else { link.target = '_blank'; link.rel = 'noopener'; }
    return link;
  };
  const openViewer = (group, selected = 0) => {
    if (document.querySelector('.pdf-overlay')) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const overlay = element('div', 'modal-overlay pdf-overlay');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'pdf-project-title');
    const panel = element('div', 'pdf-panel');
    const header = element('div', 'pdf-header');
    const title = element('h2', '', group.project);
    title.id = 'pdf-project-title';
    const subtitle = element('p', 'pdf-document-title');
    const closeButton = element('button', 'modal-close', '×');
    closeButton.setAttribute('aria-label', 'Close PDF viewer');
    const controls = element('div', 'pdf-controls');
    const label = element('label', '', 'Document');
    const select = element('select', 'pdf-select');
    select.id = 'pdf-document-choice';
    label.htmlFor = select.id;
    group.documents.forEach((doc, i) => {
      const option = element('option', '', doc.title);
      option.value = String(i);
      select.append(option);
    });
    select.value = String(selected);
    if (group.documents.length > 1) controls.append(label, select);
    const actions = element('div', 'pdf-actions');
    const fallback = element('p', 'pdf-fallback', 'PDF not displaying on your device? Use Open PDF to read it in a new tab.');
    const frame = element('iframe', 'pdf-frame');
    const showDocument = () => {
      const doc = group.documents[Number(select.value)];
      subtitle.textContent = doc.title;
      frame.title = `${group.project}: ${doc.title}`;
      frame.src = `${pdfURL(doc)}#view=FitH`;
      actions.replaceChildren(pdfLink(doc, 'Open PDF ↗'), pdfLink(doc, 'Download PDF ↓', true));
    };
    select.addEventListener('change', showDocument);
    showDocument();
    header.append(title, subtitle, controls, actions, fallback, closeButton);
    panel.append(header, frame);
    overlay.append(panel);
    document.body.append(overlay);
    document.body.style.overflow = 'hidden';
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
    const onKey = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      }
      if (event.key === 'Tab') {
        const focusable = [...panel.querySelectorAll('button, a, select, iframe')];
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    closeButton.addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    requestAnimationFrame(() => overlay.classList.add('open'));
    closeButton.focus();
  };
  const viewerButton = (group, index, text) => {
    const button = element('button', 'btn btn-ghost', text);
    button.type = 'button';
    button.addEventListener('click', () => openViewer(group, index));
    return button;
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.showcase-card').forEach(card => {
      const project = card.querySelector('.showcase-title')?.textContent.trim();
      const group = catalog.find(item => !item.unassigned && item.project === project);
      if (!group) return;
      let actions = card.querySelector('.showcase-links');
      if (!actions) { actions = element('div', 'showcase-links'); card.querySelector('.showcase-body').append(actions); }
      const button = viewerButton(group, 0, 'Technical Analysis →');
      button.dataset.analysisProject = project;
      actions.append(button);
      if (group.systems) {
        const systems = card.querySelector('[data-project-systems]');
        if (systems) {
          systems.append(element('h3', '', 'Gameplay Systems'));
          group.systems.forEach(system => systems.append(systemArticle(system, 'project-system-breakdown')));
        }
        const link = element('a', 'btn btn-ghost', 'Gameplay Systems →');
        link.href = new URL(`technical-writeups.html#${group.systemsAnchor}`, siteRoot).href;
        actions.append(link);
      }
      if (group.listOnCard) {
        const documents = element('div', 'showcase-desc');
        documents.append(element('strong', '', 'Documentation & Dev Diaries'));
        const list = element('ul', 'project-systems-list');
        group.documents.forEach((doc, index) => {
          const item = element('li');
          const documentButton = viewerButton(group, index, doc.title);
          documentButton.dataset.analysisProject = project;
          documentButton.dataset.analysisIndex = String(index);
          item.append(documentButton);
          list.append(item);
        });
        documents.append(list);
        actions.before(documents);
      }
    });
    // Delegation also handles buttons cloned into the existing project popup.
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-analysis-project]');
      if (!button || !button.closest('.modal-panel')) return;
      const group = catalog.find(item => item.project === button.dataset.analysisProject);
      if (group) openViewer(group, Number(button.dataset.analysisIndex || 0));
    });
    const collection = document.getElementById('writeups-collection');
    if (!collection) return;
    const sections = new Map();
    catalog.forEach(group => {
      const heading = group.category || group.project;
      let section = sections.get(heading);
      if (!section) {
        section = element('section', 'writeup-group');
        section.append(element('h2', '', heading));
        sections.set(heading, section);
        collection.append(section);
      }
      if (group.systems) {
        section.id = group.systemsAnchor;
        const projectLink = element('a', 'btn btn-ghost', 'Open Project →');
        projectLink.href = new URL(group.projectURL, siteRoot).href;
        section.append(projectLink);
        group.systems.forEach(system => section.append(systemArticle(system, 'writeup-document writeup-system')));
        section.append(element('h3', 'writeup-documents-heading', 'Design Documentation'));
      }
      group.documents.forEach((doc, index) => {
        const article = element('article', 'writeup-document');
        const details = element('div');
        details.append(element('h3', '', doc.title), element('p', '', group.unassigned ? doc.file : group.project));
        const actions = element('div', 'showcase-links');
        actions.append(viewerButton(group, index, 'View PDF →'), pdfLink(doc, 'Open in New Tab ↗'));
        if (group.projectURL) {
          const projectLink = element('a', 'btn btn-ghost', 'Open Project →');
          projectLink.href = new URL(group.projectURL, siteRoot).href;
          projectLink.setAttribute('aria-label', `Open ${group.project} project details`);
          actions.append(projectLink);
        }
        article.append(details, actions);
        section.append(article);
      });
    });
    const target = document.getElementById(window.location.hash.slice(1));
    if (target?.classList.contains('writeup-group')) requestAnimationFrame(() => target.scrollIntoView());
  });
})();
