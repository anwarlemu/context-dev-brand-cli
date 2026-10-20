// The home page's use case samples, as context.dev shows them (production main 2f4c4559, marketing-api-examples.ts and
// product-code-samples.ts): every product in the six SDK languages. Shared by the use-cases and how-it-works examples.
import type { PersonaGlyphName } from "@/components/visuals/persona-glyph";
import type { UseCaseSample } from "@/components/site/use-case-how-it-works";

export type HomeUseCase = { id: string; title: string; description: string; glyph: PersonaGlyphName; docsUrl: string; samples: UseCaseSample[] };

export const HOME_USE_CASES: HomeUseCase[] = [
  {
    id: "scrape",
    title: "Scrape anything",
    description: "Get Markdown, HTML, screenshots, images, or structured fields from any URL.",
    glyph: "scrape",
    docsUrl: "https://docs.context.dev",
    samples: [
      { language: "typescript", label: "TypeScript", filename: "scrape.ts", install: "npm install context.dev", code: `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: 'YOUR_API_KEY' });

const page = await client.web.scrape({
  url: 'https://linear.app',
  formats: {
    markdown: true,
    html: true,
    screenshot: true,
  },
  sharedParams: { mainContentOnly: true },
});

if (page.markdown.success) console.log(page.markdown.data);
if (page.screenshot.success) console.log(page.screenshot.data);` },
      { language: "python", label: "Python", filename: "scrape.py", install: "pip install context.dev", code: `from context.dev import ContextDev

client = ContextDev(api_key="YOUR_API_KEY")

response = client.web.scrape(
    url="https://linear.app",
    formats={
        "html": True,
        "markdown": True,
        "screenshot": True
    },
    shared_params={
        "main_content_only": True
    },
)
print(response)` },
      { language: "ruby", label: "Ruby", filename: "scrape.rb", install: "gem install context.dev base64", code: `require "cgi/core"
require "context_dev"

client = ContextDev::Client.new(api_key: "YOUR_API_KEY")

response = client.web.scrape(
  url: "https://linear.app",
  formats: {
    html: true,
    markdown: true,
    screenshot: true
  },
  shared_params: {
    main_content_only: true
  }
)
puts response` },
      { language: "php", label: "PHP", filename: "scrape.php", install: "composer require \"context-dev/context-dev-php:^2.24\" guzzlehttp/guzzle", code: `<?php

require_once 'vendor/autoload.php';

use ContextDev\\Client;

$client = new Client(apiKey: 'YOUR_API_KEY');

$response = $client->web->scrape(
    url: 'https://linear.app',
    formats: [
        'html' => true,
        'markdown' => true,
        'screenshot' => true
    ],
    sharedParams: [
        'mainContentOnly' => true
    ]
);

var_dump($response);` },
      { language: "go", label: "Go", filename: "scrape.go", install: "go get github.com/context-dot-dev/context-go-sdk/v2", code: `package main

import (
	"context"
	"fmt"

	contextdev "github.com/context-dot-dev/context-go-sdk/v2"
	"github.com/context-dot-dev/context-go-sdk/v2/option"
)

func main() {
	client := contextdev.NewClient(
		option.WithAPIKey("YOUR_API_KEY"),
	)

	response, err := client.Web.Scrape(context.TODO(), contextdev.WebScrapeParams{
		URL: "https://linear.app",
		Formats: contextdev.WebScrapeParamsFormats{
			HTML:       contextdev.Bool(true),
			Markdown:   contextdev.Bool(true),
			Screenshot: contextdev.Bool(true),
		},
		SharedParams: contextdev.WebScrapeParamsSharedParams{
			MainContentOnly: contextdev.Bool(true),
		},
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("%+v\\n", response)
}` },
      { language: "curl", label: "cURL", filename: "scrape.sh", install: null, code: `curl --request POST 'https://api.context.dev/v1/web/scrape' \\
  --header 'Authorization: Bearer YOUR_API_KEY' \\
  --header 'Content-Type: application/json' \\
  --data '{
  "url": "https://linear.app",
  "formats": {
    "html": true,
    "markdown": true,
    "screenshot": true
  },
  "sharedParams": {
    "mainContentOnly": true
  }
}'` },
    ],
  },
  {
    id: "map",
    title: "Map domains",
    description: "Discover page URLs across a domain, with titles and descriptions when available.",
    glyph: "map",
    docsUrl: "https://docs.context.dev",
    samples: [
      { language: "typescript", label: "TypeScript", filename: "map.ts", install: "npm install context.dev", code: `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: 'YOUR_API_KEY' });

const { urls } = await client.web.mapUrls({
  domain: 'stripe.com',
  includeSubdomains: true,
  maxLinks: 100,
});

for (const page of urls) {
  console.log(page.url, page.title, page.description);
}` },
      { language: "python", label: "Python", filename: "map.py", install: "pip install context.dev", code: `from context.dev import ContextDev

client = ContextDev(api_key="YOUR_API_KEY")

response = client.web.map_urls(
    domain="stripe.com",
    include_subdomains=True,
    max_links=100,
)
print(response)` },
      { language: "ruby", label: "Ruby", filename: "map.rb", install: "gem install context.dev base64", code: `require "cgi/core"
require "context_dev"

client = ContextDev::Client.new(api_key: "YOUR_API_KEY")

response = client.web.map_urls(
  domain: "stripe.com",
  include_subdomains: true,
  max_links: 100
)
puts response` },
      { language: "php", label: "PHP", filename: "map.php", install: "composer require \"context-dev/context-dev-php:^2.24\" guzzlehttp/guzzle", code: `<?php

require_once 'vendor/autoload.php';

use ContextDev\\Client;

$client = new Client(apiKey: 'YOUR_API_KEY');

$response = $client->web->mapUrls(
    domain: 'stripe.com',
    includeSubdomains: true,
    maxLinks: 100
);

var_dump($response);` },
      { language: "go", label: "Go", filename: "map.go", install: "go get github.com/context-dot-dev/context-go-sdk/v2", code: `package main

import (
	"context"
	"fmt"

	contextdev "github.com/context-dot-dev/context-go-sdk/v2"
	"github.com/context-dot-dev/context-go-sdk/v2/option"
)

func main() {
	client := contextdev.NewClient(
		option.WithAPIKey("YOUR_API_KEY"),
	)

	response, err := client.Web.MapURLs(context.TODO(), contextdev.WebMapURLsParams{
		Domain:            "stripe.com",
		IncludeSubdomains: contextdev.Bool(true),
		MaxLinks:          contextdev.Int(100),
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("%+v\\n", response)
}` },
      { language: "curl", label: "cURL", filename: "map.sh", install: null, code: `curl -X GET "https://api.context.dev/v1/web/urls?domain=stripe.com&includeSubdomains=true&maxLinks=100" \\
  -H "Authorization: Bearer YOUR_API_KEY"` },
    ],
  },
  {
    id: "batches",
    title: "Run batches",
    description: "Scrape thousands of URLs or crawl a site in the background with one batch job.",
    glyph: "batches",
    docsUrl: "https://docs.context.dev/api-reference/batches/submit",
    samples: [
      { language: "typescript", label: "TypeScript", filename: "batches.ts", install: "npm install context.dev", code: `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: 'YOUR_API_KEY' });

const urls = [
  'https://example.com',
  'https://example.com/pricing',
  'https://example.com/docs',
];

const batch = await client.batch.submit({
  input: {
    mode: 'scrape',
    data: {
      formats: { markdown: true },
      urls: urls.map((url) => ({ url })),
    },
  },
});

console.log(batch.id, batch.status);` },
      { language: "python", label: "Python", filename: "batches.py", install: "pip install context.dev", code: `from context.dev import ContextDev

client = ContextDev(api_key="YOUR_API_KEY")

batch = client.batch.submit(
    input={
        "mode": "scrape",
        "data": {
            "formats": {"markdown": True},
            "urls": [
                {
                    "url": "https://example.com",
                },
                {
                    "url": "https://example.com/pricing",
                },
                {
                    "url": "https://example.com/docs",
                },
            ],
        },
    },
)
print(batch.id, batch.status)` },
      { language: "ruby", label: "Ruby", filename: "batches.rb", install: "gem install context.dev base64", code: `require "cgi/core"
require "context_dev"

client = ContextDev::Client.new(api_key: "YOUR_API_KEY")

batch = client.batch.submit(
  input: {
    mode: "scrape",
    data: {
      formats: {markdown: true},
      urls: [
        {
          url: "https://example.com"
        },
        {
          url: "https://example.com/pricing"
        },
        {
          url: "https://example.com/docs"
        }
      ]
    }
  }
)

puts(batch.id)` },
      { language: "php", label: "PHP", filename: "batches.php", install: "composer require \"context-dev/context-dev-php:^2.24\" guzzlehttp/guzzle", code: `<?php

require_once 'vendor/autoload.php';

use ContextDev\\Client;

$client = new Client(apiKey: 'YOUR_API_KEY');

$batch = $client->batch->submit(
    input: [
        'mode' => 'scrape',
        'data' => [
            'formats' => ['markdown' => true],
            'urls' => [
                [
                    'url' => 'https://example.com',
                ],
                [
                    'url' => 'https://example.com/pricing',
                ],
                [
                    'url' => 'https://example.com/docs',
                ],
            ],
        ],
    ],
);

var_dump($batch);` },
      { language: "go", label: "Go", filename: "batches.go", install: "go get github.com/context-dot-dev/context-go-sdk/v2", code: `package main

import (
	"context"
	"fmt"

	contextdev "github.com/context-dot-dev/context-go-sdk/v2"
	"github.com/context-dot-dev/context-go-sdk/v2/option"
)

func main() {
	client := contextdev.NewClient(
		option.WithAPIKey("YOUR_API_KEY"),
	)

	batch, err := client.Batch.Submit(context.TODO(), contextdev.BatchSubmitParams{
		Input: contextdev.BatchSubmitParamsInputUnion{
			OfScrape: &contextdev.BatchSubmitParamsInputScrape{
				Data: contextdev.BatchSubmitParamsInputScrapeData{
					Formats: contextdev.BatchSubmitParamsInputScrapeDataFormats{
						Markdown: contextdev.Bool(true),
					},
					URLs: []contextdev.BatchSubmitParamsInputScrapeDataURL{
						{URL: "https://example.com"},
						{URL: "https://example.com/pricing"},
						{URL: "https://example.com/docs"},
					},
				},
			},
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\\n", batch.ID)
}` },
      { language: "curl", label: "cURL", filename: "batches.sh", install: null, code: `curl -X POST "https://api.context.dev/v1/batch/submit" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
  "input": {
    "mode": "scrape",
    "data": {
      "formats": {"markdown": true},
      "urls": [
        {
          "url": "https://example.com"
        },
        {
          "url": "https://example.com/pricing"
        },
        {
          "url": "https://example.com/docs"
        }
      ]
    }
  }
}'` },
    ],
  },
  {
    id: "answers",
    title: "Answers from the web",
    description: "Ask a research question and get structured answers with source URLs.",
    glyph: "chat",
    docsUrl: "https://docs.context.dev",
    samples: [
      { language: "typescript", label: "TypeScript", filename: "answers.ts", install: "npm install context.dev", code: `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: 'YOUR_API_KEY' });

const answer = await client.web.answers({
  task: 'Find the main product features on linear.app.',
  mode: 'fast',
  json_format: {
    features: [''],
  },
});

console.log(answer.json_content);
console.log(answer.sources);` },
      { language: "python", label: "Python", filename: "answers.py", install: "pip install context.dev", code: `from context.dev import ContextDev

client = ContextDev(api_key="YOUR_API_KEY")

response = client.web.answers(
    task="Find the main product features on linear.app.",
    mode="fast",
    json_format={"features": [""]},
)
print(response)` },
      { language: "ruby", label: "Ruby", filename: "answers.rb", install: "gem install context.dev base64", code: `require "cgi/core"
require "context_dev"

client = ContextDev::Client.new(api_key: "YOUR_API_KEY")

response = client.web.answers(
  task: "Find the main product features on linear.app.",
  mode: :fast,
  json_format: { "features" => [""] }
)
puts response` },
      { language: "php", label: "PHP", filename: "answers.php", install: "composer require \"context-dev/context-dev-php:^2.24\" guzzlehttp/guzzle", code: `<?php

require_once 'vendor/autoload.php';

use ContextDev\\Client;

$client = new Client(apiKey: 'YOUR_API_KEY');

$response = $client->web->answers(
    task: 'Find the main product features on linear.app.',
    jsonFormat: ['features' => ['']],
    mode: 'fast',
);

var_dump($response);` },
      { language: "go", label: "Go", filename: "answers.go", install: "go get github.com/context-dot-dev/context-go-sdk/v2", code: `package main

import (
	"context"
	"fmt"

	contextdev "github.com/context-dot-dev/context-go-sdk/v2"
	"github.com/context-dot-dev/context-go-sdk/v2/option"
)

func main() {
	client := contextdev.NewClient(
		option.WithAPIKey("YOUR_API_KEY"),
	)

	response, err := client.Web.Answers(context.TODO(), contextdev.WebAnswersParams{
		Task:       "Find the main product features on linear.app.",
		Mode:       contextdev.WebAnswersParamsModeFast,
		JsonFormat: map[string]any{"features": []any{""}},
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("%+v\\n", response)
}` },
      { language: "curl", label: "cURL", filename: "answers.sh", install: null, code: `curl -X POST "https://api.context.dev/v1/web/answers" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
  "task": "Find the main product features on linear.app.",
  "mode": "fast",
  "json_format": {
    "features": [
      ""
    ]
  }
}'` },
    ],
  },
  {
    id: "monitors",
    title: "Create monitors",
    description: "Watch pages for changes on a schedule and send updates to your webhook.",
    glyph: "monitor",
    docsUrl: "https://docs.context.dev/api-reference/monitors/create",
    samples: [
      { language: "typescript", label: "TypeScript", filename: "monitors.ts", install: "npm install context.dev", code: `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: 'YOUR_API_KEY' });

const monitor = await client.monitors.create({
  name: 'Linear pricing changes',
  mode: 'web',
  target: {
    type: 'page',
    url: 'https://linear.app/pricing',
  },
  change_detection: { type: 'exact' },
  schedule: {
    type: 'interval',
    frequency: 6,
    unit: 'hours',
  },
});

console.log(monitor.id);` },
      { language: "python", label: "Python", filename: "monitors.py", install: "pip install context.dev", code: `from context.dev import ContextDev

client = ContextDev(api_key="YOUR_API_KEY")

monitor = client.monitors.create(
    name="Linear pricing changes",
    mode="web",
    target={
        "type": "page",
        "url": "https://linear.app/pricing",
    },
    change_detection={
        "type": "exact",
    },
    schedule={
        "type": "interval",
        "frequency": 6,
        "unit": "hours",
    },
)
print(monitor.id)` },
      { language: "ruby", label: "Ruby", filename: "monitors.rb", install: "gem install context.dev base64", code: `require "cgi/core"
require "context_dev"

client = ContextDev::Client.new(api_key: "YOUR_API_KEY")

monitor = client.monitors.create(
  name: "Linear pricing changes",
  mode: "web",
  target: {
    type: "page",
    url: "https://linear.app/pricing"
  },
  change_detection: {
    type: "exact"
  },
  schedule: {
    type: "interval",
    frequency: 6,
    unit: "hours"
  }
)

puts(monitor.id)` },
      { language: "php", label: "PHP", filename: "monitors.php", install: "composer require \"context-dev/context-dev-php:^2.24\" guzzlehttp/guzzle", code: `<?php

require_once 'vendor/autoload.php';

use ContextDev\\Client;

$client = new Client(apiKey: 'YOUR_API_KEY');

$response = $client->monitors->create(
    name: 'Linear pricing changes',
    mode: 'web',
    target: [
        'type' => 'page',
        'url' => 'https://linear.app/pricing',
    ],
    changeDetection: [
        'type' => 'exact',
    ],
    schedule: [
        'type' => 'interval',
        'frequency' => 6,
        'unit' => 'hours',
    ],
);

var_dump($response);` },
      { language: "go", label: "Go", filename: "monitors.go", install: "go get github.com/context-dot-dev/context-go-sdk/v2", code: `package main

import (
	"context"
	"fmt"

	contextdev "github.com/context-dot-dev/context-go-sdk/v2"
	"github.com/context-dot-dev/context-go-sdk/v2/option"
)

func main() {
	client := contextdev.NewClient(
		option.WithAPIKey("YOUR_API_KEY"),
	)

	monitor, err := client.Monitors.New(context.TODO(), contextdev.MonitorNewParams{
		Name: "Linear pricing changes",
		Mode: contextdev.MonitorNewParamsModeWeb,
		Target: contextdev.MonitorNewParamsTargetUnion{
			OfPage: &contextdev.MonitorNewParamsTargetPage{
				URL: "https://linear.app/pricing",
			},
		},
		ChangeDetection: contextdev.MonitorNewParamsChangeDetectionUnion{
			OfExact: &contextdev.MonitorNewParamsChangeDetectionExact{},
		},
		Schedule: contextdev.MonitorNewParamsSchedule{
			Type:      "interval",
			Frequency: 6,
			Unit:      "hours",
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\\n", monitor.ID)
}` },
      { language: "curl", label: "cURL", filename: "monitors.sh", install: null, code: `curl -X POST "https://api.context.dev/v1/monitors" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
  "mode": "web",
  "name": "Linear pricing changes",
  "target": {
    "type": "page",
    "url": "https://linear.app/pricing"
  },
  "change_detection": {
    "type": "exact"
  },
  "schedule": {
    "type": "interval",
    "frequency": 6,
    "unit": "hours"
  }
}'` },
    ],
  },
  {
    id: "brand",
    title: "Retrieve brand data",
    description: "Get the company profile and the website's design system from one domain.",
    glyph: "company",
    docsUrl: "https://docs.context.dev",
    samples: [
      { language: "typescript", label: "TypeScript", filename: "brand.ts", install: "npm install context.dev", code: `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: 'YOUR_API_KEY' });

const [{ brand }, { styleguide }] = await Promise.all([
  client.brand.retrieve({
    type: 'by_domain',
    domain: 'notion.so',
  }),
  client.web.extractStyleguide({
    domain: 'notion.so',
  }),
]);

console.log(brand);
console.log(styleguide);` },
      { language: "python", label: "Python", filename: "brand.py", install: "pip install context.dev", code: `from context.dev import ContextDev

client = ContextDev(api_key="YOUR_API_KEY")

brand = client.brand.retrieve(
    domain="notion.so",
    type="by_domain",
)
styleguide = client.web.extract_styleguide(
    domain="notion.so",
)

print(brand)
print(styleguide)` },
      { language: "ruby", label: "Ruby", filename: "brand.rb", install: "gem install context.dev base64", code: `require "cgi/core"
require "context_dev"

client = ContextDev::Client.new(api_key: "YOUR_API_KEY")

brand = client.brand.retrieve(
  body: {
    domain: "notion.so",
    type: :by_domain
  }
)
styleguide = client.web.extract_styleguide(
  domain: "notion.so"
)

puts brand
puts styleguide` },
      { language: "php", label: "PHP", filename: "brand.php", install: "composer require \"context-dev/context-dev-php:^2.24\" guzzlehttp/guzzle", code: `<?php

require_once 'vendor/autoload.php';

use ContextDev\\Client;

$client = new Client(apiKey: 'YOUR_API_KEY');

// Retrieve Brand goes through the low-level request method so one lookup type can be sent on its own.
$raw = $client->request(
    method: 'post',
    path: 'brand/retrieve',
    body: [
        'domain' => 'notion.so',
        'type' => 'by_domain',
    ],
);
$brand = json_decode((string) $raw->getBody(), true, flags: JSON_THROW_ON_ERROR);

$styleguide = $client->web->extractStyleguide(
    domain: 'notion.so',
);

var_dump($brand);
var_dump($styleguide);` },
      { language: "go", label: "Go", filename: "brand.go", install: "go get github.com/context-dot-dev/context-go-sdk/v2", code: `package main

import (
	"context"
	"fmt"

	contextdev "github.com/context-dot-dev/context-go-sdk/v2"
	"github.com/context-dot-dev/context-go-sdk/v2/option"
)

func main() {
	client := contextdev.NewClient(
		option.WithAPIKey("YOUR_API_KEY"),
	)

	brand, err := client.Brand.Get(context.TODO(), contextdev.BrandGetParams{
		OfByDomain: &contextdev.BrandGetParamsBodyByDomain{
			Domain: "notion.so",
		},
	})
	if err != nil {
		panic(err)
	}

	styleguide, err := client.Web.ExtractStyleguide(context.TODO(), contextdev.WebExtractStyleguideParams{
		Domain: contextdev.String("notion.so"),
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("%+v\\n", brand)
	fmt.Printf("%+v\\n", styleguide)
}` },
      { language: "curl", label: "cURL", filename: "brand.sh", install: null, code: `curl -X POST "https://api.context.dev/v1/brand/retrieve" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"domain": "notion.so", "type": "by_domain"}'

curl -X GET "https://api.context.dev/v1/web/styleguide?domain=notion.so" \\
  -H "Authorization: Bearer YOUR_API_KEY"` },
    ],
  },
];
