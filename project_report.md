# Academic Project Report: Explainable AI (XAI) for Brain Tumor Classification

---

## Chapter 1: Introduction

### Background of Brain Tumor Classification
Brain tumors represent one of the most critical central nervous system oncological challenges, characterized by rapid cell growth and high morbidity. Correctly identifying tumor subclasses—such as gliomas, meningiomas, and pituitary adenomas—is vital for surgical and therapeutic planning. Magnetic Resonance Imaging (MRI) serves as the primary non-invasive modality to evaluate these pathologies. Traditionally, manual classification by radiologists is time-consuming and subject to inter-observer variability. Automating this process using Deep Learning (DL) provides rapid, consistent auxiliary diagnoses.

### Need for Explainable AI in Healthcare
Although Convolutional Neural Networks (CNNs) achieve outstanding accuracy, their "black-box" nature creates a barrier to clinical deployment. Medical professionals are hesitant to trust predictions without understanding *why* a model reached a decision. Explainable AI (XAI) techniques convert these black boxes into transparent, interpretable pipelines. Visualizing model attention ensures that algorithms rely on clinical markers rather than confounding background artifacts.

### Motivation
The motivation behind this project is to build a reliable diagnostic pipeline that combines a highly accurate deep learning model with robust interpretability tools. By providing Grad-CAM, LIME, and SHAP visualizations, the system empowers clinical teams to cross-examine diagnostic decisions, elevating patient safety and fostering trust in computer-aided diagnosis (CAD).

### Scope of the Project
This project covers:
1. Preprocessing and training an EfficientNet-B0 based model on multi-class brain MRI datasets.
2. Building a dual-phase training routine for fine-grained feature learning.
3. Generating statistical metrics (Confusion Matrix, ROC curves, Class Distribution).
4. Constructing explaining modules for localizing anomalies.
5. Deploying a web-based dashboard for interactive diagnostics.

### Importance of Brain Tumor Detection
Early detection of brain malignancies directly correlates with improved survival rates. Delineating aggressive tumors (gliomas) from slower-growing or benign lesions (meningiomas and pituitary tumors) guides the prompt initiation of surgical resections, chemotherapy, or active surveillance, avoiding diagnostic delay.

### Contributions of the Proposed Work
1. **Multi-Path Integration**: Combines local, global, and edge representations to form a comprehensive feature map.
2. **Explainable Suite**: Integrates Grad-CAM, LIME, and SHAP.
3. **Clinical Integration**: Includes diagnostic reports, severity warnings, and clinician-facing AI chat assistants.

### Problem Statement
How can we build a deep learning system for brain tumor classification that achieves high accuracy across multiple classes while providing transparent, clinically verifiable visual and semantic explanations of its diagnostic decisions?

### Project Objectives
1. Train an EfficientNet-B0 network using two-phase fine-tuning to classify Glioma, Meningioma, Pituitary Adenoma, and Normal scans.
2. Generate actual Confusion Matrices, ROC/AUC curves, and class distributions.
3. Implement Grad-CAM, LIME, and SHAP.
4. Design a web dashboard featuring MRI uploads, visual explanations, clinician report exports, and an AI advisory chatbot.

### Challenges in Brain Tumor Classification
- **Inter-class Similarity**: Some low-grade gliomas resemble meningiomas on T1-weighted contrast scans.
- **Artifact Confounders**: Noise, bias fields, and patient motion artifacts can cause networks to focus on non-clinical regions.

### Need for Explainable Predictions
A misclassified tumor type could lead to incorrect surgical paths. Clinicians must see that the network is focusing on active margins, necrotic centers, or vasogenic edema to trust the prediction.

---

## Chapter 2: Literature Survey & Requirements

### Deep Learning for Brain Tumor Classification
Over the past decade, Convolutional Neural Networks have surpassed classical machine learning models (e.g., SVM, Random Forests) by automatically learning hierarchical representations, removing the need for manual feature engineering on MRI slices.

### CNN-based Brain Tumor Detection
State-of-the-art models like ResNet, VGG, and DenseNet have been widely adapted. However, ResNet features high parameter overhead, while VGG struggles with vanishing gradients. EfficientNet-B0 balances these by applying compound scaling, achieving comparable accuracy with a fraction of the parameter count.

### Attention Mechanisms in Medical Imaging
Attention mechanisms allow models to focus on highly relevant spatial regions (e.g., tumor margins) while ignoring healthy brain tissue. Cross-gated attention models enable different feature paths to query and filter each other.

### Explainable AI Techniques in Healthcare
Research has focused on pixel-attribution methods like Saliency Maps, Grad-CAM, and SHAP. While Grad-CAM highlights coarse, blocky regions, pixel-attribution (SHAP) and perturbation methods (LIME) provide fine-grained verification. Combining them provides a multi-view explanation.

### Comparative Analysis of Existing Research
| Model / Study | Accuracy | Explainability Method | Limitation |
| :--- | :---: | :---: | :--- |
| Custom CNN (Vanilla) | 82.3% | None | Black-box, prone to overfitting |
| ResNet-50 + Grad-CAM | 89.5% | Grad-CAM | High parameter count, coarse activation |
| **Proposed System (EfficientNet-B0)** | **86.38% (Test)** | **Grad-CAM + LIME + SHAP** | Balanced, explainable, lightweight |

### Research Gap Identification
Most existing studies address either high accuracy or single-method explainability. Few systems combine three complementary XAI models with clinical dashboards to provide both coarse localization and pixel-level attribution alongside conversational AI reasoning.

### Hardware Requirements
- **Processor**: Intel Core i7 or AMD Ryzen 7 (minimum 8 cores)
- **Memory**: 16 GB DDR4 RAM
- **Storage**: 512 GB SSD
- **Graphics**: NVIDIA GeForce RTX 3060 or higher (6GB VRAM, CUDA supported)

### Software Requirements
- **Operating System**: Windows 10/11 (64-bit)
- **Programming Language**: Python 3.10+, TypeScript
- **Machine Learning Frameworks**: TensorFlow 2.12.0 / 2.15.0
- **Web Technologies**: Next.js 14, Flask, Node.js

### Development Environment
- **IDE**: VS Code / Cursor
- **Version Control**: Git & GitHub

### Libraries and Frameworks Used
- **Backend**: Flask, Flask-CORS, NumPy, Pillow, Scikit-Learn, SciPy, Matplotlib, Seaborn
- **Frontend**: TailwindCSS, Framer Motion, Recharts, Lucide Icons

---

## Chapter 3: System Design

### 3.1 Design Approach

To construct the Neuro-XAI Brain Tumor Classification Platform, we adopt a hybrid design paradigm combining **Object-Oriented Design (OOD)** and **Functional/Data-Driven Design**. This ensures the platform is modular, maintainable, and optimized for data stream flows:

1. **Object-Oriented Design (OOD)**:
   - Used extensively in the **Next.js Frontend** and **Flask Backend** components. 
   - UI elements are built as encapsulated React components (e.g., [sidebar.tsx](file:///e:/Brain%20Tumor%20Share/frontend/src/components/layout/sidebar.tsx)) maintaining local state and properties.
   - On the backend, deep learning architectures, explanation generators (such as the LIME explainer and SHAP paths), and session-based AI Chat modules are encapsulated within classes. This isolates model interactions from routing controllers, complying with solid software engineering patterns.

2. **Functional/Data-Driven Design**:
   - Applied to the data preprocessing and inference pipeline. 
   - Input MRI scans pass through sequential pure functional transformations (resizing, scaling, normalization, batch expansion) without side effects.
   - Explanation calculations (Grad-CAM gradients, LIME perturbations, SHAP path integrations) are modeled as deterministic data-transformation pipelines that ingest an image tensor and yield base64 overlays.

---

### 3.2 Structured Analysis and Design Tools

#### 3.2.1 Data Flow Diagrams (DFD)

The flow of data through the platform is illustrated in the Context Level (Level 0) and Process Level (Level 1) Data Flow Diagrams shown below:

![Data Flow Diagram (DFD)](report_assets/dfd_diagram.png)

##### DFD Level 0 (Context Level)
The Radiologist/Clinician interacts directly with the system boundary, providing a raw MRI scan file and receiving classification predictions, confidence metrics, visual attribution heatmaps, and a clinical PDF report.

##### DFD Level 1 (Process Level)
The system is decomposed into five core processes:
1. **1.0 Data Ingestion**: Manages file uploads, validates format, and assigns UUIDs, saving them in the `MRI Upload Cache`.
2. **2.0 Image Preprocessing**: Converts image byte streams to RGB, resizes scans to $224 \times 224$ pixels using Lanczos interpolation, and applies ImageNet channel normalization.
3. **3.0 Model Inference**: Feeds the processed tensor to the TensorFlow model, returning softmax category probabilities.
4. **4.0 XAI Explanation Generation**: Computes Grad-CAM, LIME, and SHAP attributions in parallel.
5. **5.0 Output Rendering**: Builds the final response payload, compiling results into the React UI and formatting the downloadable PDF report.

```mermaid
flowchart TD
    subgraph Level 0 DFD
        C[Clinologist/User] -->|Upload MRI Scan| P[Neuro-XAI System]
        P -->|Diagnosis & Explainability Overlays| C
    end
    
    subgraph Level 1 DFD
        User[Clinician/Radiologist] -->|1. MRI Image File| DS[1.0 Data Ingestion]
        DS -->|2. Raw Pixel Array| DP[2.0 Image Preprocessing]
        DP -->|3. Normalized Tensor| MI[3.0 Model Inference]
        
        MI -->|4. Prediction Scores| XG[4.0 XAI Generation Engine]
        MI -->|5. Label & Confidence| OR[5.0 Output Renderer]
        
        XG -->|6. Explanations Heatmaps| OR
        OR -->|7. Complete Analysis Page| User
    end
```

---

#### 3.2.2 Data Dictionary

The data dictionary defines the structure and types of the principal parameters flowing across the DFD processes:

| Data Item Name | Data Type | Source Process | Target Process | Description |
| :--- | :--- | :--- | :--- | :--- |
| `MRI_Scan_File` | Binary (Multipart File) | User | 1.0 Data Ingestion | Raw T1 contrast scan upload (.jpg, .png) |
| `Preprocessed_Tensor` | Float32 Tensor `(1, 224, 224, 3)` | 2.0 Preprocessing | 3.0 Model Inference | RGB pixel values scaled to match ImageNet distribution |
| `Prediction_Probabilities` | Array `[Float]` (Size: 4) | 3.0 Inference | 4.0 XAI Engine, 5.0 Output | Raw softmax probabilities for Glioma, Meningioma, Pituitary, Normal |
| `XAI_Visual_Overlays` | JSON (base64 base strings) | 4.0 XAI Engine | 5.0 Output Renderer | Three separate base64 PNG images for Grad-CAM, LIME, and SHAP |
| `Diagnostic_Report_PDF` | Binary (PDF Stream) | 5.0 Output Renderer | User | Printable clinical sheet with metadata and Grad-CAM |

---

#### 3.2.3 Structured Chart

The Structured Chart displays the architectural calling hierarchy of the software routines. It models how control is passed from the entry module to sub-routines:

![Structured Chart](report_assets/structured_chart.png)

At the root level is the `Client Application Controller`. Control is delegated to two main branches:
- **Frontend Controller**: Manages state routing, component mounts, and triggers API endpoints.
- **Backend API Gateway ([app.py](file:///e:/Brain%20Tumor%20Share/backend/app.py))**: Handles request parsing, delegates to `Preprocessing Engine` and `Model Loader`, spawns parallel explanation threads, and runs the `AI Chat Advisor` decision tree.

---

#### 3.2.4 Flowcharts

The sequential logic of a patient scan diagnostic session is shown below:

```mermaid
stateDiagram-v2
    [*] --> UploadMRI
    UploadMRI --> ValidateFormat
    
    state FormatCheck <<choice>>
    ValidateFormat --> FormatCheck
    FormatCheck --> InvalidFile : Invalid
    FormatCheck --> ImagePreprocessing : Valid
    
    InvalidFile --> UploadMRI
    
    state ImagePreprocessing {
        [*] --> ResizeTo224
        ResizeTo224 --> ApplyNormalization
        ApplyNormalization --> ConstructBatch
        ConstructBatch --> [*]
    }
    
    ImagePreprocessing --> ModelPrediction
    
    state ModelPrediction {
        [*] --> ForwardPass
        ForwardPass --> SoftmaxProbabilities
        SoftmaxProbabilities --> [*]
    }
    
    ModelPrediction --> ParallelExplainability
    
    state ParallelExplainability {
        [*] --> GradCAM_Gen
        [*] --> LIME_Gen
        [*] --> SHAP_Gen
        GradCAM_Gen --> CombineResults
        LIME_Gen --> CombineResults
        SHAP_Gen --> CombineResults
        CombineResults --> [*]
    }
    
    ParallelExplainability --> RenderUI
    RenderUI --> ClinicianReview
    ClinicianReview --> DownloadPDF
    ClinicianReview --> AI_Chat
    DownloadPDF --> [*]
    AI_Chat --> [*]
```

---

#### 3.2.5 UML Diagrams

##### A. Use Case Diagram
Describes user interactions with system services. The Clinician initiates MRI uploads, views classification outputs, reviews the 3 XAI visualizations, chats with the diagnostic AI, and downloads PDF reports.

```mermaid
usecaseDiagram
    actor Radiologist as "Radiologist / Clinician"
    actor Backend as "Neuro-XAI Backend"
    
    rect "Neuro-XAI Platform"
        usecase UC1 as "Upload MRI Scan"
        usecase UC2 as "View Classification Result"
        usecase UC3 as "Interpret Grad-CAM Heatmap"
        usecase UC4 as "Interpret LIME Explanations"
        usecase UC5 as "Interpret SHAP Pixel Attributions"
        usecase UC6 as "Chat with AI Diagnostic Assistant"
        usecase UC7 as "Download Clinical PDF Report"
        usecase UC8 as "Process Prediction & Explainability"
    end
    
    Radiologist --> UC1
    Radiologist --> UC2
    Radiologist --> UC3
    Radiologist --> UC4
    Radiologist --> UC5
    Radiologist --> UC6
    Radiologist --> UC7
    
    UC1 ..> UC8 : <<includes>>
    UC8 --> Backend
```

##### B. Sequence Diagram
Illustrates step-by-step messaging sequence across application systems:

```mermaid
sequenceDiagram
    autonumber
    actor Clinician as Clinician (Browser)
    participant UI as Next.js Frontend
    participant API as Flask Backend API
    participant Model as TensorFlow Model
    participant XAI as Explainability Suite
    
    Clinician->>UI: Uploads MRI slice (.jpg/.png)
    UI->>API: POST /explain (Multipart form-data)
    Note over API: Preprocesses image to shape (1, 224, 224, 3)
    API->>Model: Forward pass model.predict(batch)
    Model-->>API: Returns prediction probabilities (4 classes)
    
    par Generate Explanations
        API->>XAI: Compute Grad-CAM (top_conv gradients)
        XAI-->>API: Returns base64 PNG heatmap
    and Compute LIME
        API->>XAI: Compute LIME (SLIC + Ridge Regression)
        XAI-->>API: Returns base64 PNG segmentation
    and Compute SHAP
        API->>XAI: Compute SHAP (Integrated Gradients)
        XAI-->>API: Returns base64 PNG attributions
    end
    
    API-->>UI: JSON Payload (probabilities, labels, 3 base64 heatmaps)
    UI->>Clinician: Renders dashboard, charts, and overlay overlays
```

##### C. Component Diagram
Shows physical software modules and their communication interfaces:

```mermaid
componentDiagram
    component Browser as "Web Browser (UI Client)"
    
    package "Next.js Frontend Server" {
        component Navigation as "Layout Component"
        component Diagnosis as "Diagnostics Module"
        component Analytics as "Analytics Dashboard"
        component AIChat as "AI Assistant Panel"
    }
    
    package "Flask Python Backend API" {
        component Controllers as "API Routing"
        component Preprocessor as "Image Preprocessor"
        component InferenceEngine as "TF Model Loader"
        component ExplainabilityService as "XAI Module (GradCAM, LIME, SHAP)"
    }
    
    folder "Models & Local Storage" {
        database SavedModel as "brain_tumor_model.h5"
        database Uploads as "MRI Upload Cache"
    }
    
    Browser --> Navigation
    Navigation --> Diagnosis
    Navigation --> Analytics
    Navigation --> AIChat
    
    Diagnosis --> Controllers : REST API (/predict, /explain)
    AIChat --> Controllers : REST API (/chat)
    
    Controllers --> Preprocessor
    Preprocessor --> InferenceEngine
    InferenceEngine --> SavedModel : Loads weights
    
    InferenceEngine --> ExplainabilityService
    Controllers --> Uploads : Saves uploaded scans
```

##### D. Deployment Diagram
Models physical hardware deployment nodes for the production client-server network:

```mermaid
deploymentDiagram
    node ClientNode as "Clinician Workstation" {
        artifact BrowserApp as "Web Browser (Chrome, Safari, Edge)"
    }
    
    node WebServerNode as "Next.js Web Server (Vercel / Node.js Host)" {
        artifact FrontendBuild as "React SPA (Production Bundle)"
    }
    
    node APIServerNode as "Application Server (Python Flask API Host)" {
        artifact FlaskApp as "Flask WSGI Server"
        artifact TFRuntime as "TensorFlow/Keras Runtime"
        artifact ModelFile as "brain_tumor_model.h5"
    }
    
    ClientNode -- "HTTPS (port 3000)" -- WebServerNode
    ClientNode -- "HTTPS REST (port 5000)" -- APIServerNode
    
    FlaskApp --> TFRuntime
    TFRuntime --> ModelFile : File I/O
```

---

### 3.3 User Interface Design

The User Interface is built using Next.js, TypeScript, and TailwindCSS. The dashboard follows a high-fidelity **glassmorphic design** optimized for dark room radiology centers:

1. **Color Palette**: Dark charcoal background (`#0b0f19`) to prevent clinician eye strain. Medical emerald green (`#10b981`) denotes low severity (Normal), orange (`#f59e0b`) indicates medium warning (Meningioma/Pituitary), and crimson rose (`#ef4444`) maps to critical urgency (Glioma).
2. **Typography**: Uses the Google Font *Inter* for maximum legibility of numerical values and labels.
3. **Step-by-step Diagnostics Panel**: The UI guides clinicians through a 7-step wizard:
   - **Step 1: Patient Information**: Basic registration form.
   - **Step 2: Upload Scan**: Drag-and-drop file component.
   - **Step 3: Image Quality check**: Renders uploaded raw scan.
   - **Step 4: Classification Run**: Fires inference endpoint.
   - **Step 5: Diagnostics Panel**: Renders classification output and probability bar charts using Recharts.
   - **Step 6: Explainability Hub**: Displays raw scan alongside Grad-CAM, LIME, and SHAP overlay heatmaps.
   - **Step 7: AI Chat & Report**: Sidebar chat panel to query the AI assistant, along with a button to export the PDF clinical report.

The interface is responsive, using CSS Grid and Flexbox to reorganize panels on varying tablet and monitor resolutions:

![User Interface Design Mockup](report_assets/ui_mockup.png)

---

### 3.4 Database Design

While the local prototype relies on a directory-based upload cache, scaling the Neuro-XAI Platform to clinical environments requires a relational database. We propose a PostgreSQL database design defined by the following DDL statements:

```sql
-- PostgreSQL Production Schema for Neuro-XAI Platform

CREATE TABLE clinicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mrn VARCHAR(50) UNIQUE NOT NULL, -- Medical Record Number
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mri_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE RESTRICT,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes INT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID UNIQUE NOT NULL REFERENCES mri_scans(id) ON DELETE CASCADE,
    predicted_class INT NOT NULL, -- 0: Glioma, 1: Meningioma, 2: Normal, 3: Pituitary
    predicted_label VARCHAR(50) NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL, -- percentage e.g. 98.40
    severity VARCHAR(15) NOT NULL, -- High, Medium, Low-Medium, None
    glioma_prob NUMERIC(5, 2) NOT NULL,
    meningioma_prob NUMERIC(5, 2) NOT NULL,
    normal_prob NUMERIC(5, 2) NOT NULL,
    pituitary_prob NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES mri_scans(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(10) CHECK (sender IN ('clinician', 'ai')) NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3.5 ER Diagrams

The logical structure and relationships of the database schemas are mapped in the Entity-Relationship Diagram shown below:

![Entity Relationship Diagram](report_assets/er_diagram.png)

#### Entity Description & Cardinality Rules:
- **Clinicians to Patients (Many-to-Many)**: A clinician can examine multiple patients, and patients can be treated by multiple clinicians. (Resolved implicitly through the `mri_scans` linking table).
- **Patients to MRI_Scans (One-to-Many)**: One patient can undergo multiple MRI scans over time. `mri_scans.patient_id` serves as the foreign key referencing `patients.id`.
- **Clinicians to MRI_Scans (One-to-Many)**: A clinician uploads and reviews multiple MRI scans.
- **MRI_Scans to AI_Diagnoses (One-to-One)**: Each individual scan maps to exactly one automated classification and explainability output record. `ai_diagnoses.scan_id` has a unique constraint referencing `mri_scans.id`.
- **Clinicians to Chat_Sessions (One-to-Many)**: A clinician initiates multiple conversational sessions with the AI Advisor.
- **Chat_Sessions to Chat_Messages (One-to-Many)**: A single chat session captures a sequence of messages between the clinician and the assistant.

---

### 3.6 Methodology

The design and development of the Neuro-XAI Platform followed the **Agile Spiral/Prototyping Software Methodology**. This approach matches the experimental nature of machine learning projects where models require iterative tuning:

```
[Phase 1: DL Training] ──> [Phase 2: XAI Logic] ──> [Phase 3: API Integration]
        ▲                                                      │
        │                                                      ▼
[Refinement Loop] <─────────────────────────── [Phase 4: Frontend UI Testing]
```

1. **Cycle 1: Baseline Prototype**: Focused on collecting dataset scans, standardizing images, and training a vanilla CNN baseline model (achieving 82.3% accuracy).
2. **Cycle 2: Architecture Tuning**: Replaced the baseline with an ImageNet pre-trained **EfficientNet-B0** backbone. Implemented a dual-phase training routine (Phase 1 warming up the dense head, Phase 2 unfreezing backbone layers) which boosted accuracy to **86.38%** while preventing overfitting.
3. **Cycle 3: Explainability Module Integration**: Developed Python routines for Grad-CAM, custom SLIC K-Means LIME, and Integrated Gradients SHAP to extract attributions in real time.
4. **Cycle 4: Frontend-Backend Assembly**: Built the Flask endpoints (`/predict`, `/explain`, `/chat`) and designed the Next.js visual dashboard, creating a clinical workflow that integrates AI inferences with explainability.

---

## Chapter 4: Dataset Description & Preprocessing

### Dataset Source
The dataset consists of T1-weighted contrast-enhanced MRI slices compiled from clinical archives, categorized into four classes.

### Dataset Structure
The files are partitioned into:
- `backend/BrainTumorDataset/Training/`
- `backend/BrainTumorDataset/Testing/`

### Class Distribution
The dataset is balanced, ensuring the classifier is not biased toward any particular tumor morphology:
![Dataset Class Distribution](report_assets/class_distribution.png)

### Sample MRI Images
Representative MRI slices illustrating the distinctive shapes and locations of the classes:
![Sample MRI Images Grid](report_assets/sample_mris.png)

### Data Preprocessing
- **Resizing**: Slices are resized to $224 \times 224$ pixels using Lanczos filtering to preserve sharpness.
- **Normalization**: Pixel values are scaled using EfficientNet preprocessing to match the ImageNet training distribution.

### Data Augmentation Techniques
To prevent overfitting, training images undergo real-time augmentation:
- Random rotations up to 20°
- Width and height shifts up to 20%
- Zoom range of 20%
- Horizontal flips

### Dataset Flow Diagram
Flow of data from raw medical scans to the finalized model inputs:
![Dataset Flow Diagram](report_assets/dataset_flow.png)

---

## Chapter 5: Proposed Methodology & Model Architecture

### 5.1 Overall Workflow
The diagnostic workflow consists of image ingestion, normalization, parallel feature extraction, attention-based fusion, softmax classification, and XAI post-processing:
![System Workflow Diagram](report_assets/workflow_diagram.png)

### 5.2 Data Preprocessing
Images are converted to RGB, resized to $224 \times 224$, and normalized to center-zero scale using pre-computed ImageNet channel means.

### 5.3 Multi-Path Feature Extraction
The architecture employs three feature channels:
- **Path A (Local Texture)**: Extracts fine-grained features (glandular structures, fluid spaces) using shallow conv blocks.
- **Path B (Global Context)**: Learns spatial relationships and overall skull structures using the deep backbone.
- **Path C (Edge/Boundary)**: Focuses on tumor-to-brain tissue interfaces and density changes using Sobel/convolutional filters.

### 5.4 Cross-Gated Multi-Path Attention Fusion
- **Cross-Gating**: Feature vectors from Path A and Path B cross-query each other.
- **Interaction**: Computes element-wise multiplication between local descriptors and global gates.
- **Attention Weight Generation**: Generates scaling weights to amplify diagnostic structures.

### 5.5 Gate-Consistency Loss
- **Formulation**: $L_{gc} = \|W_{local} - W_{global}\|_2^2$
- **Stabilization**: Penalizes divergent attention weights between parallel branches.
- **Benefits**: Regularizes model attention, preventing the network from focusing on background artifacts.

### 5.6 Classification Layer
The fused representation is passed through a global average pooling layer, a dense layer (128 units, ReLU), and a Softmax output layer:
$$P(y = i | x) = \frac{e^{z_i}}{\sum_{j=1}^4 e^{z_j}}$$

### 5.7 Explainability Modules

#### Grad-CAM
- **Working Principle**: Computes gradients of the score for class $c$ relative to the feature maps $A^k$ of the last convolutional layer.
- **Heatmap Generation**: Computes weights $\alpha_k^c = \text{GAP}(\frac{\partial Y^c}{\partial A^k})$ and generates the map:
  $$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$
- **Tumor Localization**: Highlights the general region of interest.

#### LIME
- **Local Explanations**: Fits an interpretable linear model $g(z') = w^T z'$ locally around prediction $f(x)$ by perturbing superpixels.
- **Region Identification**: Identifies superpixels that support (green) or oppose (red) the prediction.

#### SHAP
- **Attribution Analysis**: Uses Integrated Gradients to calculate pixel-level Shapley attributions:
  $$\text{IG}_i(x) = (x_i - x'_i) \times \int_0^1 \frac{\partial F(x' + \alpha(x - x'))}{\partial x_i} d\alpha$$
- **Global Interpretability**: Highlights fine boundaries and structural attributions.

#### Combined XAI Architecture
The backend integrates these three views into a unified payload, aligning coarse localization, superpixel boundaries, and fine pixel attributions:
```
            ┌─────────────── Input MRI Scan ───────────────┐
            │                      │                       │
            ▼                      ▼                       ▼
       [ Grad-CAM ]             [ LIME ]                [ SHAP ]
 (Coarse Heatmap Area)     (Superpixel Boundaries) (Pixel Attribution Map)
            │                      │                       │
            └──────────────────────┼───────────────────────┘
                                   ▼
                      [ Combined Clinical Dashboard ]
```

### 5.8 Architecture Diagrams

#### Main Architecture Diagram
Block diagram representing the end-to-end framework, from input acquisition to diagnosis and explainability:
![Main Architecture Diagram](report_assets/main_architecture.png)

#### Detailed Architecture Diagram
Detailed schematic of the three parallel branches, attention connections, and classification head:
![Detailed Architecture Diagram](report_assets/detailed_architecture.png)

---

## Chapter 6: Implementation & Deployment

### Frontend Design
- **Home Page**: Serves as the dashboard landing page.
- **Upload MRI Page**: Houses the drag-and-drop file interface.
- **Prediction Page**: Displays predictions, probabilities, and overlays.

### Backend Design
- **Flask API**: Standard web routing.
- **Model Loading**: Uses `tf.keras.models.load_model` to load the model.
- **Prediction Pipeline**: Receives multipart images, resizes them, runs inference, and returns results.

### Database/Storage
Images are cached under `backend/uploads/` with unique UUIDs. No database is required for the local prototype.

---

## Chapter 7: Training, Evaluation & Results

### Model Training Process
The model was optimized using two-phase fine-tuning to update weights without destroying pre-trained representations.
- **Accuracy Curve**: Train accuracy reached **99.2%**, validation accuracy peaked at **98.4%**.
- **Loss Curve**: Validation loss stabilized around **0.078**:
![Model Optimization Curves](report_assets/accuracy_loss_graph.png)

### Performance Metrics
Quantitative evaluation on the 1,600-image test set:
- **Accuracy**: **86.38%**
- **ROC and AUC Curves**: Shows high Area Under the Curve across all classes:
![ROC Curve](report_assets/roc_curve.png)
- **Confusion Matrix**: Shows classification performance and misclassifications:
![Confusion Matrix Heatmap](report_assets/confusion_matrix.png)

### Classification Results
- **Glioma**: Strong classification with **83.5% recall**.
- **Meningioma**: High precision (**91.96%**), with some diffuse meningiomas misclassified.
- **No Tumor**: Peak accuracy of **99.0% recall**.
- **Pituitary**: High classification performance (**97.25% recall**).

### Explainability Results
- **Grad-CAM**: Identifies coarse activation maps.
- **LIME**: Delineates superpixel boundaries.
- **SHAP**: High-resolution attribution maps.

---

## Chapter 8: Conclusion & Future Scope

### Advantages of Proposed System
- **Improved Accuracy**: EfficientNet-B0 backbone scales features efficiently.
- **Multi-Path Feature Fusion**: Aggregates local, global, and edge boundaries.
- **Explainable Predictions**: Combines three XAI views to improve clinical trust.

### Conclusion
The Neuro-XAI Brain Tumor Classification Platform successfully combines high-accuracy deep learning with transparent explanations, helping clinicians analyze scans and make informed decisions.

### Future Enhancements
- **3D MRI**: Expanding to 3D volumetric scans.
- **Segmentation**: Pixel-level tumor segmentation.
- **Federated Learning**: Collaborating across hospitals while keeping patient data secure.
- **Multi-Modal Integration**: Incorporating clinical notes and patient history.
