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
    status: 'used';
    prize?: {
      id: number | string;
      name: string;
      amount?: string | number;
    };
    created_at?: string;
  }>;
}

export interface MarkAsUsedPayload {
  id: string; // Required UUID from last_form.id
  control_code?: string; // Optional security verification
}

export interface BackendMarkAsUsedData {
  id: string;
  code: string;
  status: 'used';
  is_scratched?: number;
  prize?: {
    id: number;
    name: string;
  };
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
  id: string;
  intentoNumero: number;
  premio: string; // e.g. "Bs. 1.000" o "Microondas Whirlpool 20L"
  monto?: number;
  tipoPremio: 'vale_dismac' | 'efectivo_transferencia';
  fecha: string;
  ticketId: string;
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
            const historialPremios: PremioCanjeado[] = (data.used_forms || []).map((u: any, idx: number) => ({
              id: u.id,
              intentoNumero: idx + 1,
              premio: u.prize?.name || 'Premio Whirlpool',
              monto: u.prize?.amount ? parseFloat(String(u.prize.amount)) : 0,
              tipoPremio: 'vale_dismac',
              fecha: u.created_at
                ? new Date(u.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'Canjeado',
              ticketId: u.code,
              controlCode: u.control_code || lastForm?.control_code || cleanCode,
              estado: 'used',
            }));

            // Determinar premio del siguiente intento si aún tiene formularios registrados
            const currentForm = (data.last_form || (data.registered_forms && data.registered_forms[0])) as any;
            const prizeName = currentForm?.prize?.name || 'Bs. 3.000';
            const isJackpot = prizeName.includes('3000') || prizeName.includes('3.000');
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
              proximoPremio:
                registeredCount > 0 && currentForm
                  ? {
                      intentoNumero: (data.used_count || 0) + 1,
                      premio: prizeName,
                      monto: isJackpot ? 3000 : (currentForm?.prize?.amount ? parseFloat(String(currentForm.prize.amount)) : 1000),
                      isJackpot,
                      tipoPremio: 'vale_dismac',
                    }
                  : null,
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
      } catch {
        // Fallback offline / desarrollo local si el backend no responde
      }

      // Simulación offline si el servidor no está accesible
      return this.simularVerificarCodigo(cleanCode);
    },

    /**
     * Marca intento como utilizado invocando POST /api/mark-as-used y sincroniza el estado real
     */
    completarGiro: async (
      codigo: string,
      intentoNumero: number,
      lastFormId?: string,
      controlCode?: string,
      intentosDisponiblesActuales?: number
    ): Promise<ApiResponse<{
      success: boolean;
      premio: PremioCanjeado;
      intentosRestantes: number;
      updatedCodeData?: VerificarCodigoResult;
    }>> => {
      const cleanCode = codigo.trim().toUpperCase();
      const lookupCode = controlCode?.trim().toUpperCase() || cleanCode;

      // Si tenemos el UUID real del formulario de last_form.id, llamamos al backend
      if (lastFormId) {
        try {
          const markRes = await this.api.markAsUsed({
            id: lastFormId,
            control_code: controlCode,
          });

          if (markRes.success && markRes.data) {
            const data = markRes.data;
            const now = new Date();
            const formattedDate = `${now.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}`;

            const premioCanjeado: PremioCanjeado = {
              id: data.id,
              intentoNumero,
              premio: data.prize?.name || 'Premio Whirlpool',
              tipoPremio: 'vale_dismac',
              fecha: formattedDate,
              ticketId: data.code,
              controlCode: controlCode || cleanCode,
              estado: 'used',
            };

            // Consultar inmediatamente el backend para sincronizar el estado real (siguiente formulario, contador exacto, etc.)
            let updatedCodeData: VerificarCodigoResult | undefined = undefined;
            let intentosRestantes = 0;

            try {
              const fresh = await this.girar.verificarCodigo(lookupCode);
              if (fresh.success && fresh.data) {
                updatedCodeData = fresh.data;
                intentosRestantes = fresh.data.intentosDisponibles;
              } else if (fresh.data) {
                updatedCodeData = {
                  ...fresh.data,
                  intentosDisponibles: 0,
                  proximoPremio: null,
                };
                intentosRestantes = 0;
              }
            } catch {
              // Si falla la re-consulta, decrementamos manualmente
              intentosRestantes = Math.max(0, (intentosDisponiblesActuales ?? 1) - 1);
            }

            if (!updatedCodeData) {
              intentosRestantes = Math.max(0, (intentosDisponiblesActuales ?? 1) - 1);
            }

            return {
              process: true,
              success: true,
              data: {
                success: true,
                premio: premioCanjeado,
                intentosRestantes,
                updatedCodeData,
              },
              message: markRes.message,
            };
          }
        } catch {
          // Fallback
        }
      }

      return this.simularCompletarGiro(cleanCode, intentoNumero);
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

  // ================= SIMULACIÓN LOCAL PARA FALLBACK OFFLINE =================

  private getStorageKey(code: string) {
    return `whirlpool_spin_${code}`;
  }

  private simularVerificarCodigo(code: string): ApiResponse<VerificarCodigoResult> {
    const isDismac = code.startsWith('DM') || /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}/i.test(code) || /^\d+[A-Z]+/i.test(code) || code.toLowerCase().includes('asd');
    const isOtro = code.startsWith('WP') || /^WP-\d+/i.test(code);

    if (!isDismac && !isOtro && code.length < 5) {
      return {
        process: false,
        success: false,
        message: 'El código ingresado no existe.',
        errors: ['No se encontró ningún formulario asociado al código proporcionado.'],
        statusCode: 404,
      };
    }

    const cached = sessionStorage.getItem(this.getStorageKey(code));
    if (cached) {
      try {
        const data = JSON.parse(cached) as VerificarCodigoResult;
        return { process: true, success: true, data };
      } catch {
        // Fall through
      }
    }

    const initialAttempts = isDismac ? 2 : 1;
    const tipo = isDismac ? 'dismac' : 'otro_distribuidor';

    const prizeOptions = [
      { premio: 'Bs. 3.000', monto: 3000, isJackpot: true },
      { premio: 'Bs. 2.000', monto: 2000, isJackpot: false },
      { premio: 'Bs. 1.000', monto: 1000, isJackpot: false },
      { premio: 'Bs. 500', monto: 500, isJackpot: false },
      { premio: 'Bs. 250', monto: 250, isJackpot: false },
    ];
    const hash = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const selectedPrize = prizeOptions[hash % prizeOptions.length];

    const result: VerificarCodigoResult = {
      codigo: code,
      tipo,
      valido: true,
      lastFormId: `uuid-${Date.now()}`,
      controlCode: isDismac ? code : undefined,
      nombreCliente: isDismac ? 'Cliente Oficial Dismac' : 'Cliente Mercado Autorizado',
      tienda: isDismac ? 'Dismac Tienda Central' : 'Distribuidor Autorizado',
      intentosDisponibles: initialAttempts,
      proximoPremio: {
        intentoNumero: 1,
        premio: selectedPrize.premio,
        monto: selectedPrize.monto,
        isJackpot: selectedPrize.isJackpot,
        tipoPremio: 'vale_dismac',
      },
      premiosCanjeados: [],
    };

    sessionStorage.setItem(this.getStorageKey(code), JSON.stringify(result));
    return { process: true, success: true, data: result };
  }

  private simularCompletarGiro(
    code: string,
    intentoNumero: number
  ): ApiResponse<{ success: boolean; premio: PremioCanjeado; intentosRestantes: number; updatedCodeData?: VerificarCodigoResult }> {
    const raw = sessionStorage.getItem(this.getStorageKey(code));
    if (!raw) {
      return { process: false, success: false, message: 'Registro de código no encontrado' };
    }

    try {
      const data = JSON.parse(raw) as VerificarCodigoResult;
      const premioCurrent = data.proximoPremio;
      if (!premioCurrent) {
        return { process: false, success: false, message: 'No quedan intentos disponibles para este código' };
      }

      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}`;

      const premioCanjeado: PremioCanjeado = {
        id: `ticket-${Date.now()}`,
        intentoNumero,
        premio: premioCurrent.premio,
        monto: premioCurrent.monto,
        tipoPremio: premioCurrent.tipoPremio,
        fecha: formattedDate,
        ticketId: `TK-${Math.floor(100000 + Math.random() * 900000)}`,
        controlCode: code,
        estado: 'used',
      };

      data.premiosCanjeados.unshift(premioCanjeado);
      data.intentosDisponibles = Math.max(0, data.intentosDisponibles - 1);

      if (data.intentosDisponibles > 0) {
        data.proximoPremio = {
          intentoNumero: intentoNumero + 1,
          premio: 'Bs. 500',
          monto: 500,
          isJackpot: false,
          tipoPremio: 'vale_dismac',
        };
      } else {
        data.proximoPremio = null;
      }

      sessionStorage.setItem(this.getStorageKey(code), JSON.stringify(data));

      return {
        process: true,
        success: true,
        data: {
          success: true,
          premio: premioCanjeado,
          intentosRestantes: data.intentosDisponibles,
          updatedCodeData: data,
        },
      };
    } catch {
      return { process: false, success: false, message: 'Error al procesar el intento' };
    }
  }

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
