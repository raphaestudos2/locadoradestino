import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  ChevronUp, 
  ChevronDown,
  Check,
  CheckSquare,
  Square,
  Eye,
  Link,
  AlertCircle
} from 'lucide-react';
import { Vehicle } from '../../types';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicle: Omit<Vehicle, 'id'> | Vehicle) => void;
  vehicle?: Vehicle | null;
  title: string;
}

// Common car features
const COMMON_FEATURES = [
  'Ar condicionado',
  'Direção elétrica',
  'Direção hidráulica',
  'Vidros elétricos',
  'Trava elétrica',
  'Alarme',
  'Central multimídia',
  'Bluetooth',
  'USB',
  'Rádio AM/FM',
  'CD Player',
  'MP3',
  'Computador de bordo',
  'Piloto automático',
  'Controle de velocidade',
  'Sensor de estacionamento',
  'Câmera de ré',
  'Airbag duplo',
  'Airbag lateral',
  'ABS',
  'Freios a disco',
  'Rodas de liga leve',
  'Pneus novos',
  'Estepe',
  'Macaco',
  'Chave de roda',
  'Triângulo',
  'Extintor',
  'Kit primeiros socorros',
  'Manual do proprietário',
  'Documentação em dia',
  'IPVA pago',
  'Seguro total',
  'Rastreador GPS'
];

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicle,
  title
}) => {
  const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>({
    name: '',
    category: 'SUV',
    transmission: 'Automático',
    price: 0,
    features: [],
    images: [],
    seats: 5,
    fuel: 'Flex',
    available: true,
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    licensePlate: '',
    quantity: 1
  });

  const [originalData, setOriginalData] = useState<Omit<Vehicle, 'id'> | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<{file: File, preview: string, base64?: string}[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, string>>({});

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Maximum number of images allowed
  const MAX_IMAGES = 3;

  useEffect(() => {
    if (vehicle) {
      const vehicleData = {
        name: vehicle.name || `${vehicle.brand} ${vehicle.model}`,
        category: vehicle.category,
        transmission: vehicle.transmission,
        price: vehicle.price,
        features: [...vehicle.features],
        images: [...vehicle.images],
        seats: vehicle.seats,
        fuel: vehicle.fuel,
        available: vehicle.available || true,
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        mileage: vehicle.mileage || 0,
        licensePlate: vehicle.licensePlate || '',
        quantity: vehicle.quantity || 1
      };
      setFormData(vehicleData);
      setOriginalData(vehicleData);
    } else {
      const defaultData = {
        name: '',
        category: 'SUV',
        transmission: 'Automático',
        price: 0,
        features: [],
        images: [],
        seats: 5,
        fuel: 'Flex',
        available: true,
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        licensePlate: '',
        quantity: 1
      };
      setFormData(defaultData);
      setOriginalData(defaultData);
    }
    setUploadingImages([]);
    setNewImageUrl('');
    setImagePreview(null);
    setErrors({});
    setImageErrors({});
    setHasChanges(false);
  }, [vehicle, isOpen]);

  // Detectar mudanças no formulário
  useEffect(() => {
    if (!originalData) return;
    
    const hasFormChanged = JSON.stringify(formData) !== JSON.stringify(originalData) || 
                          uploadingImages.length > 0;
    setHasChanges(hasFormChanged);
  }, [formData, originalData, uploadingImages]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do veículo é obrigatório';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return formData.name.trim().length > 0 && formData.price > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Convert uploaded files to base64 and add to images array
    const uploadedImageUrls = uploadingImages.map(img => img.base64 || img.preview);
    const allImages = [...formData.images, ...uploadedImageUrls];
    
    const finalFormData = {
      ...formData,
      images: allImages
    };
    
    if (vehicle) {
      onSubmit({ ...vehicle, ...finalFormData });
    } else {
      onSubmit(finalFormData);
    }
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const selectAllFeatures = () => {
    setFormData(prev => ({ ...prev, features: [...COMMON_FEATURES] }));
  };

  const deselectAllFeatures = () => {
    setFormData(prev => ({ ...prev, features: [] }));
  };

  const validateImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    } catch {
      return false;
    }
  };

  const handleImageUrlChange = (url: string) => {
    setNewImageUrl(url);
    if (url.trim() && validateImageUrl(url)) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const addImageFromUrl = () => {
    if (newImageUrl.trim() && validateImageUrl(newImageUrl)) {
      if (formData.images.length >= MAX_IMAGES) {
        alert(`Máximo de ${MAX_IMAGES} imagens permitidas por veículo.`);
        return;
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
      setImagePreview(null);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    // Clear any error for this image
    if (imageErrors[index]) {
      setImageErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const moveImageUp = (index: number) => {
    if (index > 0) {
      setFormData(prev => {
        const newImages = [...prev.images];
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        return { ...prev, images: newImages };
      });
    }
  };

  const moveImageDown = (index: number) => {
    if (index < formData.images.length - 1) {
      setFormData(prev => {
        const newImages = [...prev.images];
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        return { ...prev, images: newImages };
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Check total images limit
    const totalImages = formData.images.length + uploadingImages.length + imageFiles.length;
    if (totalImages > MAX_IMAGES) {
      alert(`Máximo de ${MAX_IMAGES} imagens permitidas por veículo. Você pode adicionar apenas ${MAX_IMAGES - formData.images.length - uploadingImages.length} imagens.`);
      e.target.value = '';
      return;
    }

    // Convert files to base64 for database storage
    const processFiles = async () => {
      const newUploadingImages = await Promise.all(
        imageFiles.map(async (file) => {
          const base64 = await convertFileToBase64(file);
          const preview = URL.createObjectURL(file);
          
          return {
            file,
            preview,
            base64
          };
        })
      );
      
      setUploadingImages(prev => [...prev, ...newUploadingImages]);
    };
    
    processFiles();
    
    // Clear the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const removeUploadingImage = (index: number) => {
    setUploadingImages(prev => {
      const imageToRemove = prev[index];
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Clean up object URLs when component unmounts or modal closes
  useEffect(() => {
    return () => {
      uploadingImages.forEach(img => {
        URL.revokeObjectURL(img.preview);
      });
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Clean up when modal closes
      uploadingImages.forEach(img => {
        URL.revokeObjectURL(img.preview);
      });
      setUploadingImages([]);
    }
  }, [isOpen]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: 'Erro ao carregar imagem'
    }));
  };

  const handleImageLoad = (index: number) => {
    setImageErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-black">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Veículo *
                  </label>
                  <input
                    type="text"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Nissan Kicks SV"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Este nome será usado para identificar o veículo no sistema
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Ex: Nissan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Ex: Kicks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ano
                  </label>
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                   onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                    placeholder="Ex: 2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placa
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.licensePlate}
                    onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                    placeholder="Ex: ABC-1234"
                    maxLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatch">Hatch</option>
                    <option value="Hatch">Blindado</option>                    
                    <option value="Pickup">Pickup</option>
                    <option value="Van">Van</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmissão
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.transmission}
                    onChange={(e) => handleInputChange('transmission', e.target.value)}
                  >
                    <option value="Automático">Automático</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Combustível
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.fuel}
                    onChange={(e) => handleInputChange('fuel', e.target.value)}
                  >
                    <option value="Flex">Flex</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Elétrico">Elétrico</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assentos
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="9"
                   onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.seats}
                    onChange={(e) => handleInputChange('seats', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço por Dia (R$) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                   onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quilometragem
                  </label>
                  <input
                    type="number"
                    min="0"
                   onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade Disponível
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                   onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quantos veículos deste modelo você possui
                  </p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      checked={formData.available}
                      onChange={(e) => handleInputChange('available', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">Disponível para locação</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-lg font-semibold text-black mb-2 sm:mb-0">Equipamentos</h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllFeatures}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Marcar Todos</span>
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllFeatures}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Square className="h-4 w-4" />
                    <span>Desmarcar Todos</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {COMMON_FEATURES.map((feature) => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-white rounded transition-colors">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      checked={formData.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>

              {formData.features.length > 0 && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Equipamentos selecionados ({formData.features.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {formData.features.map((feature, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-black mb-6">Galeria de Imagens</h3>
              
              {/* Upload Methods */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* File Upload */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload de Arquivos
                    <span className="ml-2 text-sm text-gray-500">
                      ({formData.images.length + uploadingImages.length}/{MAX_IMAGES})
                    </span>
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-yellow-500 transition-colors bg-white">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={formData.images.length + uploadingImages.length >= MAX_IMAGES}
                    />
                    <label 
                      htmlFor="image-upload" 
                      className={`cursor-pointer ${
                        formData.images.length + uploadingImages.length >= MAX_IMAGES 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer'
                      }`}
                    >
                      <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-yellow-600" />
                      </div>
                      <p className="text-gray-700 font-medium mb-2">
                        {formData.images.length + uploadingImages.length >= MAX_IMAGES 
                          ? 'Limite máximo atingido' 
                          : 'Clique para selecionar imagens'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formData.images.length + uploadingImages.length >= MAX_IMAGES 
                          ? `Máximo ${MAX_IMAGES} imagens` 
                          : 'ou arraste e solte aqui'}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        PNG, JPG, GIF até 10MB cada
                      </p>
                    </label>
                  </div>
                </div>

                {/* URL Input */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 flex items-center">
                    <Link className="h-5 w-5 mr-2" />
                    Adicionar por URL
                  </h4>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="space-y-4">
                      <input
                        type="url"
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        value={newImageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                      />
                      
                      {/* URL Preview */}
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border"
                            onError={() => setImagePreview(null)}
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      
                      {newImageUrl && !imagePreview && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>URL inválida ou formato não suportado</span>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={addImageFromUrl}
                        disabled={!newImageUrl.trim() || !imagePreview || formData.images.length >= MAX_IMAGES}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-black px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>
                          {formData.images.length >= MAX_IMAGES 
                            ? 'Limite Atingido' 
                            : 'Adicionar Imagem'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploading Images Preview */}
              {uploadingImages.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Imagens Selecionadas ({uploadingImages.length}/{MAX_IMAGES - formData.images.length} restantes)
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Dica:</strong> Essas imagens serão adicionadas à galeria quando você salvar o veículo.
                      {formData.images.length + uploadingImages.length >= MAX_IMAGES && (
                        <span className="block mt-1 text-yellow-700 font-semibold">
                          ⚠️ Limite máximo de {MAX_IMAGES} imagens atingido.
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {uploadingImages.map((uploadingImage, index) => (
                      <div key={index} className="relative group bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <div className="aspect-square">
                          <img
                            src={uploadingImage.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeUploadingImage(index)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform scale-90 hover:scale-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                          <p className="text-white text-xs truncate">{uploadingImage.file.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Images Gallery */}
              {formData.images.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Galeria Atual ({formData.images.length + uploadingImages.length} {(formData.images.length + uploadingImages.length) === 1 ? 'imagem' : 'imagens'})
                  </h4>
                  <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    💡 <strong>Dica:</strong> A primeira imagem será usada como capa principal. Use as setas para reordenar as imagens.
                    {uploadingImages.length > 0 && (
                      <span className="block mt-1">
                        As {uploadingImages.length} imagens selecionadas serão adicionadas ao final da galeria.
                      </span>
                    )}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                        <div className="aspect-square relative">
                          <img
                            src={image}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(index)}
                            onLoad={() => handleImageLoad(index)}
                          />
                          
                          {/* Cover Badge */}
                          {index === 0 && (
                            <div className="absolute top-3 left-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              CAPA
                            </div>
                          )}
                          
                          {/* Image Error */}
                          {imageErrors[index] && (
                            <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
                              <div className="text-center text-red-600">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-xs">Erro ao carregar</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Hover Controls */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                              <button
                                type="button"
                                onClick={() => moveImageUp(index)}
                                disabled={index === 0}
                                className="bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 p-2 rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                title="Mover para cima"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImageDown(index)}
                                disabled={index === formData.images.length - 1}
                                className="bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 p-2 rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                title="Mover para baixo"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                title="Remover imagem"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Image Info */}
                        <div className="p-3 bg-gray-50">
                          <p className="text-xs text-gray-600 text-center font-medium">
                            Posição {index + 1}
                            {index === 0 && <span className="text-yellow-600"> • Imagem Principal</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {formData.images.length === 0 && uploadingImages.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Nenhuma imagem adicionada</h4>
                  <p className="text-gray-500 mb-4">Adicione até {MAX_IMAGES} imagens para o veículo</p>
                  <p className="text-sm text-gray-400">Use o upload de arquivos ou adicione por URL</p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || (!hasChanges && vehicle)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  isFormValid() && (hasChanges || !vehicle)
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="h-5 w-5" />
                <span>
                  {vehicle ? 
                    (hasChanges ? 'Atualizar Veículo' : 'Nenhuma alteração') : 
                    'Criar Veículo'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};