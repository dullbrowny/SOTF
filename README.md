# SpandaAI Platform

<!-- ![SpandaAI Platform Architecture-new](docs/images/platform-with-catalyst.png) -->

## A Comprehensive Multi-Domain Generative AI Ecosystem

🔍 Research layer repositories can be found [here](https://github.com/keshavaspanda?tab=repositories).

The SpandaAI Platform is a cutting-edge Generative AI (GenAI) ecosystem designed to support multiple domains such as FinTech, Healthcare, EdTech, and Oil & Gas. The platform leverages a modular, 4-layer architecture to ensure scalability, flexibility, and seamless integration of GenAI capabilities.

![SpandaAI Platform Architecture](foundation/docs/images/platform.png)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Layer Breakdown](#layer-breakdown)
   - [Solutions Layer](#solutions-layer)
   - [Domain Layer](#domain-layer)
   - [Foundation Layer](#foundation-layer)
     - [Foundation Setup Summary](docs/spanda_foundation_summary.md)
   - [Research Layer](#research-layer)
4. [Key Components](#key-components)
   - [Fine Tuning & Pre-Training](#fine-tuning--pre-training)
   - [Inference](#inference)
   - [RAG (Retrieval Augmented Generation)](#rag-retrieval-augmented-generation)
   - [Testing](#testing)
   - [Infrastructure](#infrastructure)
   - [Observability](#observability)
   - [Agentic Framework](#agentic-framework)
   - [Analytics/Lakehouse](#analyticslakehouse)
5. [Domain-Specific Capabilities](#domain-specific-capabilities)
   - [EdTech Domain](#edtech-domain)
   - [FinTech Domain](#fintech-domain)
   - [Oil & Gas Domain](#oil--gas-domain)
   - [Future Domains](#future-domains)
6. [Deployment Architecture](#deployment-architecture)
7. [Getting Started](#getting-started)
8. [Contributing](#contributing)
9. [License](#license)

---

## Introduction

The SpandaAI Platform is a state-of-the-art GenAI ecosystem developed to serve diverse industries with tailored artificial intelligence solutions. Built on four strategic layers, the platform combines cutting-edge research with practical applications, providing both foundational AI capabilities and domain-specific functionality.

This repository houses the core components of the SpandaAI ecosystem, including research foundations, shared services, domain-specific implementations, and end-user solutions.

---

## Architecture Overview

SpandaAI follows a strategic 4-layer architecture that ensures separation of concerns while enabling seamless integration between components:

1. **Solutions Layer**: End-user applications, SDKs, integration tools, and low-code solution creators
2. **Domain Layer**: Industry-specific implementations for EdTech, FinTech, Oil & Gas, and future domains
3. **Foundation Layer**: Core AI services and infrastructure components shared across domains
4. **Research Layer**: Exploratory AI research and innovation that feeds into the platform

This architecture is guided by five key principles:
- **Domain Isolation**: Each domain operates independently
- **Selective Consumption**: Domains use only the foundation services they need
- **Shared Foundation**: Common capabilities are centralized to prevent duplication
- **Agentic Foundation**: Support for AI agents is built into the core platform
- **Extensibility**: The architecture allows for easy addition of new domains and solutions

---

## Layer Breakdown

![SpandaAI Platform Architecture-new](foundation/docs/images/platform-with-catalyst.png)

### Solutions Layer

The Solutions Layer sits at the top of the architecture, providing end-user facing applications and integration capabilities:

| Component | Description |
|-----------|-------------|
| **Domain-Specific Applications** | Industry-specific AI solutions tailored to end-user needs |
| **SDKs & Integration Tools** | Developer libraries and connectivity tools for external system integration |
| **Extensible Solutions** | Framework for future solution types and emerging capabilities |
| **Low-Code Langflow Solution Creator** | Visual workflow builder for AI pipeline development with minimal coding |

### Domain Layer

The Domain Layer encapsulates business logic and specialized functionalities tailored for various industries:

| Domain | Status | Key Components |
|--------|--------|----------------|
| **EdTech** | Active | Kong API Gateway, Document Analysis, QA Generation, Educational AI Agents |
| **FinTech** | Planned | Risk Assessment, Fraud Detection, Financial AI Agents |
| **Oil & Gas** | Planned | Predictive Maintenance, Resource Optimization, Energy AI Agents |
| **Future Domains** | Planned | Healthcare, Manufacturing, and others |

Each domain maintains its own:
- Kong API Gateway for managing domain-specific endpoints
- Dapr sidecars (planned) for service communication
- Specialized domain services and AI agents

### Foundation Layer

The Foundation Layer (formerly Platform Layer) provides the core technological infrastructure and shared services:

| Component | Description |
|-----------|-------------|
| **Fine Tuning & Pre-Training** | Model customization and training capabilities |
| **Inference** | Efficient model execution and prediction generation |
| **RAG** | Retrieval Augmented Generation for enhanced responses |
| **Testing** | Validation and quality assurance of AI models |
| **Infrastructure** | Core operational systems supporting the platform |
| **Observability** | Monitoring, logging, and diagnostics tools |
| **Agentic Framework** | Management of AI agents across domains |
| **Analytics/Lakehouse** | Data storage, analysis, and intelligence capabilities |

### Research Layer

🔍 Research layer repositories can be found [here](https://github.com/keshavaspanda?tab=repositories).

The Research Layer forms the intellectual foundation of the SpandaAI Platform:

- Source of innovation and cutting-edge AI capabilities
- Exploration of new AI techniques, algorithms, and methodologies
- Theoretical foundation for practical applications
- Continuous advancement of the state of the art in generative AI

---

## Key Components

### Fine Tuning & Pre-Training

The platform supports comprehensive model training capabilities:

| Training Method | Status | Description |
|-----------------|--------|-------------|
| **Decentralized Training** | Planned | Training across distributed nodes without central coordination |
| **Federated Learning** | Planned | Privacy-preserving training where only model updates are shared |

**Supported Training Approaches:**

| Training Approach | Full-Tuning | Freeze-Tuning | LoRA | QLoRA |
|-------------------|-------------|---------------|------|-------|
| Pre-Training | ✅ | ✅ | ✅ | ✅ |
| Supervised Fine-Tuning | ✅ | ✅ | ✅ | ✅ |
| Reward Modeling | ✅ | ✅ | ✅ | ✅ |
| PPO Training | ✅ | ✅ | ✅ | ✅ |
| DPO Training | ✅ | ✅ | ✅ | ✅ |
| KTO Training | ✅ | ✅ | ✅ | ✅ |
| ORPO Training | ✅ | ✅ | ✅ | ✅ |
| SimPO Training | ✅ | ✅ | ✅ | ✅ |

### Inference

The inference component provides efficient model execution:

**Performance Features:**
- State-of-the-art serving throughput
- PagedAttention for efficient key/value memory management
- Continuous batching of incoming requests
- CUDA/HIP graph for fast execution
- Quantization support (GPTQ, AWQ, INT4, INT8, FP8)
- Optimized kernels with FlashAttention and FlashInfer
- Speculative decoding and chunked prefill

**Model Support:**
- Transformer-based LLMs (LLaMA and similar)
- Mixture-of-Experts (MoE) LLMs (Mixtral, Deepseek-V2, Deepseek-V3)
- Embedding Models (E5-Mistral)
- Multi-Modal LLMs (LLaVA)

**Implementations:**
- vLLM: High-throughput inference engine (✅ Implemented)
- Ollama: Local LLM running framework (✅ Implemented)
- Llama.cpp: Lightweight inference solution (⏱️ Planned)
- Dllama: Distributed inference implementation (⏱️ Planned)

### RAG (Retrieval Augmented Generation)

The RAG component enhances LLM responses with retrieved relevant information:

**Model & Embedding Support:**
- Ollama (e.g., Llama3) (✅)
- vLLM (✅)
- HuggingFace (e.g., MiniLMEmbedder) (✅)
- Weaviate, SentenceTransformers (✅)

**Data Support:**
- UnstructuredIO for data import (✅)
- PDF, GitHub/GitLab, CSV/XLSX, DOCX ingestion (✅)

**RAG Features:**
- Hybrid Search (✅)
- Filtering (✅)
- Customizable Metadata (✅)
- Async Ingestion (✅)
- Advanced Querying (⏱️ Planned)
- Reranking (⏱️ Planned)
- RAG Evaluation (⏱️ Planned)

**Chunking Techniques:**
- Token, Sentence, Semantic, Recursive (✅)
- HTML, Markdown, Code, JSON (✅)

**Library Support:**
- LangChain (✅)
- Haystack, LlamaIndex (⏱️ Planned)

### Testing

The testing component ensures validation and quality assurance:

| Component | Status | Description |
|-----------|--------|-------------|
| **Promptfoo Functional Testing** | ✅ | Validates core functionality of AI systems |
| **Promptfoo Risk Assessment** | ✅ | Identifies safety, reliability, and ethical breaches |
| **Predator Non-Functional Testing** | ⏱️ | Ensures non-functional needs are met |
| **LLM Guardrails** | ⏱️ | Ensures safety, reliability, and ethical constraints |

### Infrastructure

Core operational systems supporting the platform:

| Component | Status | Description |
|-----------|--------|-------------|
| **Kafka** | ✅ | Distributed event streaming platform |
| **Redis** | ✅ | In-memory data structure store |
| **Kubernetes** | ✅ | Container orchestration |
| **Docker** | ✅ | Containerization technology |
| **Helm** | ✅ | Kubernetes package manager |
| **Ray** | ✅ | Framework for distributed computing |

### Observability

Monitoring, logging, and diagnostics tools:

| Component | Status | Description |
|-----------|--------|-------------|
| **Prometheus** | ✅ | Metrics collection and monitoring |
| **Pushgateway** | ✅ | Push-based metrics collection |
| **AlertManager** | ✅ | Alert handling and notification |
| **Grafana** | ✅ | Visualization and dashboarding |
| **NodeExporter** | ✅ | Host-level metrics collector |
| **cAdvisor** | ✅ | Container metrics collector |
| **Caddy** | ✅ | Reverse proxy with basic auth |

### Agentic Framework

Management of AI agents across domains:

| Component | Status | Description |
|-----------|--------|-------------|
| **Orchestration** | ⏱️ | Coordination of multiple AI agents |
| **Management** | ⏱️ | Lifecycle and state management |
| **Agent Tools** | ⏱️ | Capabilities for AI agents |

### Analytics/Lakehouse

Data storage, analysis, and intelligence capabilities:

| Component | Status | Description |
|-----------|--------|-------------|
| **Apache Superset** | ✅ | Business intelligence web application |
| **Iceberg** | ✅ | Table format for large analytical datasets |
| **Dremio** | ✅ | Data lake engine |
| **Apache Spark** | ✅ | Analytics engine for large-scale data processing |
| **MinIO** | ✅ | High-performance object storage |
| **Nesse** | ✅ | Data processing framework |

---

## Domain-Specific Capabilities

### EdTech Domain

The EdTech domain provides specialized AI functionality for educational technology:

**Key Components:**
- **API Gateway**: Manages endpoints for educational content and user interactions
- **Data Preprocessing**: Prepares educational datasets for analysis and training
- **Document Analysis**: Extracts key information from textbooks and course materials
- **Document Similarity**: Determines similarity between educational documents
- **Educational AI Agents**: Assists in tutoring and personalized learning
- **Face Analysis**: Provides facial recognition and emotion detection
- **QA Generation**: Automates the generation of questions and answers
- **Training**: Resources for training EdTech-specific AI models

### FinTech Domain

The planned FinTech domain will focus on financial technology applications:

**Key Components:**
- Risk Assessment
- Fraud Detection
- Financial AI Agents
- Automated advisory systems

### Oil & Gas Domain

The planned Oil & Gas domain will address energy sector needs:

**Key Components:**
- Predictive Maintenance
- Resource Optimization
- Energy AI Agents
- Operational efficiency solutions

### Future Domains

The platform architecture supports expansion to additional domains:

- Healthcare
- Manufacturing
- Retail
- Transportation
- And more...

---

## Deployment Architecture

The SpandaAI Platform is designed for Kubernetes-based deployment:

1. **Containerization**: All components are containerized using Docker
2. **Orchestration**: Kubernetes manages component lifecycle and scaling
3. **Package Management**: Helm charts provide standardized deployment templates
4. **Distributed Computing**: Ray enables efficient resource allocation
5. **Messaging**: Kafka ensures reliable communication between components
6. **Caching and State**: Redis provides high-performance data access

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for production deployment)
- Helm 3.x
- Python 3.9+


---

## Contributing

We welcome contributions to the SpandaAI Platform! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest enhancements.

---

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
