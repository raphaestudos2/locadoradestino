import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl text-gray-700">
            Estamos aqui para ajudar você
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-yellow-200">
            <h2 className="text-2xl font-bold text-black mb-6">
              Informações de Contato
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Telefone</h3>
                  <p className="text-gray-700">(21) 3456-7890</p>
                  <p className="text-gray-700">(21) 99950-4512</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-black p-3 rounded-full">
                  <Mail className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Email</h3>
                  <p className="text-gray-700">contato@locadoradestino.com.br</p>
                  <p className="text-gray-700">reservas@locadoradestino.com.br</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Endereço</h3>
                  <p className="text-gray-700">
                    Estrada dos Três Rios, 958<br />
                    Freguesia, Jacarepaguá<br />
                    Rio de Janeiro - RJ
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-black p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Horário de Funcionamento</h3>
                  <p className="text-gray-700">
                    Segunda a Sexta: 8h às 18h<br />
                    Sábado: 8h às 16h<br />
                    Domingo: 8h às 12h
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-black mb-4">Redes Sociais</h3>
              <div className="flex space-x-4">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black p-3 rounded-full transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="bg-black hover:bg-gray-800 text-yellow-400 p-3 rounded-full transition-colors">
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-yellow-200">
            <h2 className="text-2xl font-bold text-black mb-6">
              Envie uma Mensagem
            </h2>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assunto
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors">
                  <option value="">Selecione um assunto</option>
                  <option value="reserva">Reserva</option>
                  <option value="duvida">Dúvida</option>
                  <option value="reclamacao">Reclamação</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors resize-none"
                  placeholder="Digite sua mensagem aqui..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};