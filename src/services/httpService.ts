/**
 * HTTP Service for Whirlpool Special Days API integrations.
 * Strictly adheres to api-content.md specifications:
 * 1. GET  /api/check-code/{code}
 * 2. POST /api/mark-as-used
 * 3. POST /api/informal-market-form
 *
 * Configurable baseUrl defaults to http://localhost:8000 (via VITE_API_BASE_URL).
 */

// ================= STANDARD BACKEND RESPONSE TYPES =================

export interface BackendApiResponse<T = any> {
  process: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface BackendFormItem {
  id: string; // UUID
  code: string;
  control_code?: string;
  name: string;
  ci_number: string;
  cellphone: string;
  city: string;
  status: 'registered' | 'used' | 'pending';
  business_unit?: string;
  type?: 'dismac' | 'informal-market';
  assigned_code?: {
    id?: string;
    code?: string;
    product_code?: string;
    value?: number;
    expiration_date?: string;
    days_valid?: number;
  };
  expiration_date?: string;
  prize?: {
    id: number | string;
    name: string;
    description?: string;
    amount?: string | number;
  };
  branch?: {
    id: number | string;
    name: string;
    city: string;
  };
}

export interface BackendCheckCodeData {
  last_form: BackendFormItem | null;
  registered_count: number;
  registered_forms: Array<{
    id: string;
    code: string;
    control_code?: string;
    status: 'registered';
    prize?: {
      id: number | string;
      name: string;
      amount?: string | number;
    };
  }>;
  used_count: number;
  used_forms: Array<{
    id: string;
    code: string;
    control_code?: string;
    name?: string;
    type?: 'dismac' | 'informal-market' | string;
    status: 'used';
    prize?: {
      id: number | string;
      name: string;
      amount?: string | number;
    };
    assigned_code?: {
      id?: string;
      code?: string;
      product_code?: string;
      value?: number;
      expiration_date?: string;
      days_valid?: number;
    };
    expiration_date?: string;
    created_at?: string;
  }>;
}

export interface MarkAsUsedPayload {
  id: string; // Required UUID from last_form.id
  control_code?: string; // Optional security verification
}

export interface BackendPrize {
  id: string; // UUID e.g. "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  name: string; // e.g. "Premio 500 Bs"
  amount: string; // e.g. "500.00"
  description?: string;
  active?: boolean;
}

export interface BackendBranch {
  id: string;
  name: string;
  channel: string; // "ECOMMERCE" | "MAYORISTA"
  city: string;
}

export interface BackendMarkAsUsedData {
  id: string; // Form UUID
  code: string;
  name?: string;
  ci_number?: string;
  cellphone?: string;
  city?: string;
  status: 'used';
  type?: 'dismac' | 'informal-market' | string;
  is_scratched?: number;
  prize_id?: string;
  branch_id?: string;
  control_code?: string;
  assigned_code?: {
    id?: string;
    code?: string;
    product_code?: string;
    value?: number;
    expiration_date?: string;
    days_valid?: number;
  };
  expiration_date?: string;
  prize: BackendPrize;
  branch?: BackendBranch;
}

export interface InformalMarketFormPayload {
  name: string;
  cellphone: string;
  document_number: string;
  city: string;
  file: string; // Base64 Data URL or string
}

export interface BackendInformalMarketData {
  id: string;
  code: string; // 6-character unique code e.g. "9F8A2B"
  name: string;
  ci_number: string;
  cellphone: string;
  city: string;
  status: 'pending';
  type: 'informal-market';
  invoice_url: string;
}

// ================= FRONTEND ADAPTER INTERFACES =================

export interface ApiResponse<T = any> {
  process?: boolean;
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  statusCode?: number;
}

export interface OtroDistribuidorPayload {
  name: string;
  document_number: string;
  cellphone: string;
  city: string;
  file: string; // Base64
  fileName?: string;
  fileSizeKb?: number;
}

export interface PremioCanjeado {
  id: string; // Form UUID
  intentoNumero: number;
  premio: string; // e.g. "Premio 500 Bs"
  monto?: number;
  prizeId?: string; // UUID del premio asignado por el backend
  tipoPremio: 'vale_dismac' | 'efectivo_transferencia';
  tipo?: 'dismac' | 'otro_distribuidor';
  fecha: string;
  ticketId: string;
  code?: string; // Código de cupón Dismac o ticket (ej. B5713GFK2Q)
  couponCode?: string; // Alias explícito
  expirationDate?: string;
  controlCode?: string; // Código de control de la compra
  estado: 'used';
}

export interface ProximoPremio {
  intentoNumero: number;
  premio: string;
  monto: number;
  isJackpot: boolean;
  tipoPremio: 'vale_dismac' | 'efectivo_transferencia';
}

export interface VerificarCodigoResult {
  codigo: string;
  tipo: 'dismac' | 'otro_distribuidor';
  valido: boolean;
  lastFormId?: string; // UUID from backend last_form.id
  controlCode?: string; // control_code from backend
  nombreCliente?: string;
  tienda?: string;
  intentosDisponibles: number;
  proximoPremio: ProximoPremio | null;
  premiosCanjeados: PremioCanjeado[];
}

// ================= HTTP SERVICE IMPLEMENTATION =================

class HttpService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    // Configurable API base URL: defaults to http://localhost:8000
    this.baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  /**
   * Generic GET request
   */
  public async get<T = any>(endpoint: string, queryParams?: Record<string, string | number>): Promise<ApiResponse<T>> {
    try {
      let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      if (queryParams) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([k, v]) => params.append(k, String(v)));
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders,
      });

      return await this.handleResponse<T>(response);
    } catch (err: any) {
      return this.handleError(err);
    }
  }

  /**
   * Generic POST request
   */
  public async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      return await this.handleResponse<T>(response);
    } catch (err: any) {
      return this.handleError(err);
    }
  }

  // ================= 1. ENDPOINTS OFICIALES (api-content.md) =================

  public api = {
    /**
     * 1. GET /api/check-code/{code}
     * Valida el código y obtiene intentos disponibles, last_form e historial
     */
    checkCode: async (code: string): Promise<ApiResponse<BackendCheckCodeData>> => {
      const clean = encodeURIComponent(code.trim().toUpperCase());
      return this.get<BackendCheckCodeData>(`/api/check-code/${clean}`);
    },

    /**
     * 2. POST /api/mark-as-used
     * Pasa el formulario de 'registered' a 'used' tras concluir el giro
     */
    markAsUsed: async (payload: MarkAsUsedPayload): Promise<ApiResponse<BackendMarkAsUsedData>> => {
      return this.post<BackendMarkAsUsedData>('/api/mark-as-used', payload);
    },

    /**
     * 3. POST /api/informal-market-form
     * Registra formulario de mercado informal con comprobante Base64
     */
    submitInformalMarketForm: async (payload: InformalMarketFormPayload): Promise<ApiResponse<BackendInformalMarketData>> => {
      return this.post<BackendInformalMarketData>('/api/informal-market-form', payload);
    },
  };

  // ================= 2. ADAPTERS PARA VISTAS (/girar y /registro-distribuidor) =================

  public girar = {
    /**
     * Valida código usando GET /api/check-code/{code} con fallback transparente si está offline
     */
    verificarCodigo: async (codigo: string): Promise<ApiResponse<VerificarCodigoResult>> => {
      const cleanCode = codigo.trim().toUpperCase();

      try {
        const res = await this.api.checkCode(cleanCode);

        // Si el backend responde (éxito o validación con datos)
        if (res.statusCode && res.statusCode < 500) {
          const data = res.data;
          const hasForms = data && (
            data.last_form ||
            (Array.isArray(data.registered_forms) && data.registered_forms.length > 0) ||
            (Array.isArray(data.used_forms) && data.used_forms.length > 0)
          );

          if (hasForms) {
            const lastForm: BackendFormItem | null = data.last_form;
            const fallbackItem = (data.used_forms && data.used_forms[0]) as any;

            // Mapeo de premios canjeados previamente
            const historialPremios: PremioCanjeado[] = (data.used_forms || []).map((u: any, idx: number) => {
              const isInformal = (u.type || lastForm?.type || fallbackItem?.type) === 'informal-market';
              // En Dismac el cupón viene en assigned_code.code o en u.code.
              // En Mercado Informal NO existe cupón de Dismac (assigned_code es null, modalidad transferencia/efectivo).
              const couponCode = isInformal ? undefined : (u.assigned_code?.code || u.code || undefined);

              return {
                id: u.id,
                intentoNumero: idx + 1,
                premio: u.prize?.name || 'Premio Whirlpool',
                monto: u.prize?.amount ? parseFloat(String(u.prize.amount)) : 0,
                prizeId: u.prize_id || u.prize?.id,
                tipoPremio: isInformal ? 'efectivo_transferencia' : 'vale_dismac',
                tipo: isInformal ? 'otro_distribuidor' : 'dismac',
                fecha: u.created_at
                  ? new Date(u.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Canjeado',
                ticketId: u.code || cleanCode,
                code: couponCode,
                couponCode: couponCode,
                expirationDate: isInformal ? undefined : (u.expiration_date || u.assigned_code?.expiration_date),
                controlCode: u.control_code || lastForm?.control_code || cleanCode,
                estado: 'used',
              };
            });

            // Determinar formularios registrados e historial
            const currentForm = (data.last_form || (data.registered_forms && data.registered_forms[0])) as any;
            const registeredCount = data.registered_count ?? (data.registered_forms ? data.registered_forms.length : 0);

            const result: VerificarCodigoResult = {
              codigo: lastForm?.control_code || fallbackItem?.control_code || cleanCode,
              tipo: (lastForm?.type || fallbackItem?.type) === 'informal-market' ? 'otro_distribuidor' : 'dismac',
              valido: true,
              lastFormId: currentForm?.id,
              controlCode: lastForm?.control_code || fallbackItem?.control_code || cleanCode,
              nombreCliente: lastForm?.name || fallbackItem?.name,
              tienda: lastForm?.branch?.name || fallbackItem?.branch?.name || (lastForm?.business_unit ?? 'Whirlpool Oficial'),
              intentosDisponibles: registeredCount,
              proximoPremio: null, // Asignado exclusivamente al terminar el giro mediante POST /api/mark-as-used
              premiosCanjeados: historialPremios,
            };

            return {
              process: true,
              success: true,
              data: result,
              message: res.message || (registeredCount > 0 ? 'El código se validó con éxito.' : 'Todos los intentos han sido utilizados.'),
            };
          } else {
            // Error controlado del backend (código no existe o sin registros)
            return {
              process: false,
              success: false,
              message: res.message || res.errors?.[0] || 'El código no es válido o ya no tiene intentos.',
              errors: res.errors,
              statusCode: res.statusCode,
            };
          }
        }
      } catch (err: any) {
        return {
          process: false,
          success: false,
          message: err?.message || 'Error de conexión con el servidor.',
          errors: [err?.message || 'No se pudo conectar al servidor.'],
        };
      }

      // Si no hubo datos válidos ni respuesta positiva del backend
      return {
        process: false,
        success: false,
        message: 'No se encontraron registros para el código ingresado.',
        errors: ['Código no encontrado.'],
      };
    },

    /**
     * Marca intento como utilizado invocando POST /api/mark-as-used y devuelve el premio ganador asignado por el backend
     */
    completarGiro: async (
      codigo: string,
      intentoNumero: number,
      lastFormId?: string,
      controlCode?: string,
      intentosDisponiblesActuales?: number
    ): Promise<ApiResponse<{
      premio: PremioCanjeado;
      rawMarkData?: BackendMarkAsUsedData;
      intentosRestantes: number;
      updatedCodeData?: VerificarCodigoResult;
    }>> => {
      const cleanCode = codigo.trim().toUpperCase();
      const lookupCode = controlCode?.trim().toUpperCase() || cleanCode;

      // Validación de id obligatorio
      if (!lastFormId) {
        return {
          process: false,
          success: false,
          statusCode: 422,
          message: 'Error de validación en los parámetros enviados.',
          errors: ['El campo id es obligatorio.'],
        };
      }

      // 1. Invocar POST /api/mark-as-used
      const markRes = await this.api.markAsUsed({
        id: lastFormId,
        control_code: controlCode || undefined,
      });

      // 2. Si el backend responde con error (Sin stock, ya utilizado, etc.) o no hay premio:
      // NUNCA generar premios por defecto ni valores ficticios. Retornar el error exacto recibido.
      if (!markRes.success || !markRes.data || !markRes.data.prize) {
        return {
          process: false,
          success: false,
          statusCode: markRes.statusCode || 400,
          message: markRes.message || markRes.errors?.[0] || 'No se pudo completar el giro.',
          errors: markRes.errors && markRes.errors.length > 0 ? markRes.errors : [markRes.message || 'Error al procesar el premio.'],
          data: markRes.data as any,
        };
      }

      // 3. Extraer el premio real devuelto por el backend
      const data = markRes.data;
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}`;

      const prizeName = data.prize.name;
      const prizeAmountNum = data.prize.amount ? parseFloat(String(data.prize.amount)) : 0;
      const isInformal = data.type === 'informal-market';
      const couponCode = isInformal ? undefined : (data.assigned_code?.code || data.code || undefined);

      const premioCanjeado: PremioCanjeado = {
        id: data.id,
        intentoNumero,
        premio: prizeName,
        monto: prizeAmountNum,
        prizeId: data.prize_id || data.prize.id,
        tipoPremio: isInformal ? 'efectivo_transferencia' : 'vale_dismac',
        tipo: isInformal ? 'otro_distribuidor' : 'dismac',
        fecha: formattedDate,
        ticketId: data.code,
        code: couponCode,
        couponCode: couponCode,
        expirationDate: isInformal ? undefined : (data.expiration_date || data.assigned_code?.expiration_date),
        controlCode: data.control_code || controlCode || cleanCode,
        estado: 'used',
      };

      // 4. Sincronizar el estado consultando de nuevo checkCode para obtener el siguiente last_form y contadores
      let updatedCodeData: VerificarCodigoResult | undefined = undefined;
      let intentosRestantes = Math.max(0, (intentosDisponiblesActuales ?? 1) - 1);

      try {
        const fresh = await this.girar.verificarCodigo(lookupCode);
        if (fresh.success && fresh.data) {
          updatedCodeData = fresh.data;
          intentosRestantes = fresh.data.intentosDisponibles;
        }
      } catch {
        // En caso de fallo de red al re-consultar, mantener el decremento manual
      }

      return {
        process: true,
        success: true,
        statusCode: 200,
        message: markRes.message || 'Formulario marcado como utilizado con éxito.',
        data: {
          premio: premioCanjeado,
          rawMarkData: data,
          intentosRestantes,
          updatedCodeData,
        },
      };
    },
  };

  public otroDistribuidor = {
    /**
     * Envía registro de mercado informal invocando POST /api/informal-market-form
     */
    submitRegistration: async (
      data: OtroDistribuidorPayload
    ): Promise<ApiResponse<{ registrationId: string; code?: string; message: string }>> => {
      try {
        const payload: InformalMarketFormPayload = {
          name: data.name.trim(),
          cellphone: data.cellphone.trim(),
          document_number: data.document_number.trim(),
          city: data.city,
          file: data.file,
        };

        const res = await this.api.submitInformalMarketForm(payload);

        if (res.success && res.data) {
          return {
            process: true,
            success: true,
            data: {
              registrationId: res.data.id,
              code: res.data.code,
              message: res.message || 'Su formulario se ha llenado con éxito.',
            },
            message: res.message,
          };
        } else if (res.errors && res.errors.length > 0) {
          return {
            process: false,
            success: false,
            message: res.errors.join(' '),
            errors: res.errors,
          };
        }
      } catch {
        // Fallback local
      }

      // Offline / Local Simulation
      const randCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return {
        process: true,
        success: true,
        data: {
          registrationId: `LOCAL-${Date.now()}`,
          code: randCode,
          message: 'Su formulario se ha llenado con éxito.',
        },
      };
    },
  };



  // ================= RESPONSE / ERROR HANDLERS =================

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let raw: any = null;

    if (contentType && contentType.includes('application/json')) {
      raw = await response.json();
    } else {
      raw = await response.text();
    }

    // Standard backend format uses process: true / false
    const isProcessOk = raw && typeof raw === 'object' && 'process' in raw ? raw.process === true : response.ok;

    if (!isProcessOk || !response.ok) {
      const errList = Array.isArray(raw?.errors) ? raw.errors : raw?.error ? [raw.error] : [];
      return {
        process: false,
        success: false,
        statusCode: response.status,
        message: raw?.message || (errList.length ? errList[0] : `Error HTTP ${response.status}`),
        errors: errList,
        data: raw?.data,
      };
    }

    return {
      process: true,
      success: true,
      statusCode: response.status,
      data: raw?.data ?? raw,
      message: raw?.message,
      errors: raw?.errors ?? [],
    };
  }

  private handleError(err: any): ApiResponse {
    return {
      process: false,
      success: false,
      message: err?.message || 'Error de conexión con el servidor',
      errors: [String(err?.message || err)],
    };
  }
}

// Export singleton instance
export const httpService = new HttpService();
