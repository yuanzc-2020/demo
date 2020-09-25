<template>
	<div class="reset-wrap">
		<Row type="flex" justify="center" align="middle" @keydown.enter.native="submitReset">
			<Col style="width: 368px; margin-top:20vh;">
				<!-- <Header /> -->
				<Row class="reset">
					<Form ref="resetForm" :model="form" :rules="rules" class="form">
						<div v-if="type=='0'">
							<FormItem prop="phone" :error="errorMobile">
								<Input v-model="form.phone" size="large" clearable placeholder="请输入注册绑定手机号"></Input>
							</FormItem>
							<FormItem prop="code">
								<Row type="flex" justify="space-between">
									<Input
										v-model="form.code"
										size="large"
										clearable
										placeholder="请输入短信验证码"
										:maxlength="10"
										class="input-verify"
									/>
									<CountDownButton
										ref="countDown"
										@on-click="sendSmsCode"
										:autoCountDown="false"
										size="large"
										:loading="sending"
										:text="getSms"
									/>
								</Row>
							</FormItem>
						</div>
						<FormItem prop="password">
							<SetPassword v-model="form.password" size="large" @on-change="changeInputPass" />
						</FormItem>
						<FormItem prop="confirmPass">
							<Input
								type="password"
								:maxlength="20"
								v-model="form.confirmPass"
								size="large"
								clearable
								placeholder="请再次输入确认密码"
							/>
						</FormItem>
					</Form>
					<Button
						style="margin-bottom:3vh"
						type="primary"
						size="large"
						:loading="loading"
						@click="submitReset"
						long
					>重置密码</Button>
					<Row type="flex">
						<Button type="dashed" @click="$router.go(-1)">返回登录</Button>
					</Row>
				</Row>
				<Footer />
			</Col>
		</Row>
	</div>
</template>

<script>
import { sendResetSms, resetByMobile } from '@/api/card-system-api';
import { validateMobile, validatePassword } from '@/libs/validate';
import Header from '@/views/main-components/header';
import Footer from '@/views/main-components/footer';
import CountDownButton from '@/views/my-components/xboot/count-down-button';
import SetPassword from '@/views/my-components/xboot/set-password';

export default {
	components: {
		CountDownButton,
		SetPassword,
		Header,
		Footer
	},
	data() {
		const validateConfirmPass = (rule, value, callback) => {
			if (value.length < 8) {
				callback(new Error('密码长度不得小于8位'));
			} else if (value !== this.form.password) {
				callback(new Error('两次输入的密码不一致'));
			} else {
				callback();
			}
		};
		return {
			loading: false,
			type: '0',
			form: {
				phone: '',
				password: '',
				passStrength: '',
				code: ''
			},
			sended: false,
			sending: false,
			getSms: '获取验证码',
			errorMobile: '',
			errorEmail: '',
			rules: {
				phone: [
					{
						required: true,
						message: '手机号不能为空',
						trigger: 'blur'
					},
					{
						validator: validateMobile,
						trigger: 'blur'
					}
				],
				password: [
					{
						required: true,
						message: '密码不能为空',
						trigger: 'blur'
					},
					{
						validator: validatePassword,
						trigger: 'blur'
					}
				],
				code: [
					{
						required: true,
						message: '验证码不能为空',
						trigger: 'blur'
					}
				],
				confirmPass: [
					{
						required: true,
						message: '确认密码不能为空',
						trigger: 'blur'
					},
					{
						validator: validateConfirmPass,
						trigger: 'blur'
					}
				]
			}
		};
	},
	methods: {
		showVaptcha() {
			if (this.type == '0') {
				var reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
				if (!reg.test(this.form.phone)) {
					this.errorMobile = '手机号格式错误';
					return;
				} else {
					this.errorMobile = '';
				}
			} else if (this.type == '1') {
				var reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
				if (!reg.test(this.form.email)) {
					this.errorEmail = '邮箱格式错误';
					return;
				} else {
					this.errorEmail = '';
				}
			}
		},
		sendSmsCode() {
			if (this.form.phone == '') {
				this.$Msg.warning('手机号不能为空');
				return;
			}
			var reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
			if (!reg.test(this.form.phone)) {
				this.$Msg.warning('手机号格式错误');
				return;
			}
			this.sending = true;
			this.getSms = '发送中';
			sendResetSms({ phone: this.form.phone }).then(res => {
				this.getSms = '获取验证码';
				this.sending = false;
				if (res.success) {
					this.$Msg.success('发送短信验证码成功');
					// 开始倒计时
					this.$refs.countDown.startCountDown();
				}
			});
		},
		changeInputPass(v, grade, strength) {
			this.form.passStrength = strength;
		},
		submitReset() {
			this.$refs.resetForm.validate(valid => {
				if (valid) {
					this.loading = true;
					let pubKey = this.getStore('pubKey');
					if (pubKey == '') {
						this.$Msg.warning('pubKey为空');
						return;
					}
					let password = this.getRsaCode(this.form.password, pubKey);
					resetByMobile({
						phone: this.form.phone,
						password: password,
						code: this.form.code
					}).then(res => {
						this.loading = false;
						if (res.success) {
							this.$Msg.success('重置密码成功，请牢记您的新密码');
							this.$router.push({
								name: 'login'
							});
						}
					});
				}
			});
		}
	},
	mounted() {}
};
</script>

<style lang="less">
@import './common-reset.less';
</style>
