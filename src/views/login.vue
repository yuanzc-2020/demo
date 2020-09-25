<template>
	<div class="login">
		<row>
			<Header />
		</row>
		<Row
			class="middle-table-row login-triangle"
			type="flex"
			justify="center"
			align="middle"
			@keydown.enter.native="submitLogin"
		>
			<Col style="width: 368px; margin: 10px">
				<Row>
					<Row v-model="tabName">
						<span class="title-name">Login</span>
						<Form
							ref="usernameLoginForm"
							:model="form"
							:rules="rules"
							class="form"
							v-if="tabName == 'username'"
						>
							<FormItem prop="phone">
								<Input
									v-model="form.phone"
									prefix="ios-phone-portrait"
									size="large"
									clearable
									placeholder="请输入手机号"
								/>
							</FormItem>
							<FormItem prop="password">
								<Input
									type="password"
									v-model="form.password"
									prefix="ios-lock"
									size="large"
									password
									placeholder="请输入密码"
									autocomplete="off"
								/>
							</FormItem>
							<FormItem prop="code" :error="errorCode">
								<Row type="flex" justify="space-between">
									<Input
										v-model="form.code"
										prefix="ios-mail-outline"
										size="large"
										clearable
										placeholder="请输入验证码"
										:maxlength="6"
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
						</Form>
					</Row>
					<Row>
						<Button
							class="login-btn"
							type="primary"
							size="large"
							:loading="loading"
							@click="submitLogin"
							long
						>
							<span v-if="!loading">{{ $t('login') }}</span>
							<span v-else>{{ $t('logining') }}</span>
						</Button>
					</Row>
					<Row
						type="flex"
						justify="space-between"
						align="middle"
						style="margin-top: 10px"
					>
						<Button type="dashed" @click="handleResetByMobile"
							>重置密码</Button
						>
					</Row>
				</Row>
			</Col>
		</Row>
		<row type="flex" justify="center" align="middle">
			<Footer />
		</row>
	</div>
</template> 
<script>
import {
	getRsaKey,
	sendLoginSms,
	sendResetSms,
	login,
	logout,
} from '@/api/card-system-api';
import { validateMobile, validatorCodeNumber } from '@/libs/validate';
import Header from '@/views/main-components/header';
import Footer from '@/views/main-components/footer';
import RectLoading from '@/views/my-components/xboot/rect-loading';
import CountDownButton from '@/views/my-components/xboot/count-down-button';
export default {
	components: {
		CountDownButton,
		RectLoading,
		Header,
		Footer,
	},
	data() {
		return {
			error: false,
			tabName: 'username',
			getSms: '获取验证码',
			loading: false,
			sending: false,
			errorCode: '',
			form: {
				phone: '18099997777',
				password: '111222',
				code: '123456',
			},
			rules: {
				phone: [
					{
						required: true,
						message: '手机号不能为空',
						trigger: 'blur',
					},
					{
						validator: validateMobile,
						trigger: 'blur',
					},
				],
				password: [
					{
						required: true,
						message: '密码不能为空',
						trigger: 'blur',
					},
				],
				code: [
					{
						required: true,
						message: '验证码不能为空',
						trigger: 'blur',
					},
					{
						validator: validatorCodeNumber,
						trigger: 'blur',
					},
				],
			},
			pubKey: '123456',
		};
	},
	methods: {
		init() {
			// getRsaKey().then((res) => {
			// 	if (res.success) {
			// 		this.pubKey = res.result;
			// 		this.setStore('pubKey', res.result);
			// 	}
			// });
		},
		sendSmsCode() {
			if (this.pubKey == '') {
				this.$Msg.warning('pubKey为空');
				return;
			} else {
				if (this.form.phone == '') {
					this.$Msg.warning('phone不能为空');
					return;
				}
				if (this.form.password == '') {
					this.$Msg.warning('password不能为空');
					return;
				}
				let password = this.getRsaCode(this.form.password, this.pubKey);
				this.sending = true;
				this.getSms = '发送中';
				sendLoginSms({
					phone: this.form.phone,
					password: password,
				}).then((res) => {
					this.getSms = '获取验证码';
					this.sending = false;
					if (res.success) {
						this.$Msg.success('发送验证码成功');
						this.$refs.countDown.startCountDown();
					}
				});
			}
		},
		submitLogin() {
			if (this.tabName == 'username') {
				this.$refs.usernameLoginForm.validate((valid) => {
					if (valid) {
						if (this.form.code == '') {
							this.errorCode = '验证码不能为空';
							return;
						} else {
							this.errorCode = '';
						}
						if (this.pubKey == '') {
							this.$Msg.warning('pubKey为空');
							return;
						}
						this.loading = true;
						let password = this.getRsaCode(
							this.form.password,
							this.pubKey
						);
						login({
							phone: this.form.phone,
							password: password,
							code: this.form.code,
						}).then((res) => {
							if (res.success) {
								this.afterLogin(res);
							} else {
								this.loading = false;
							}
						});
					}
				});
			}
		},
		afterLogin(res) {
			this.setCookieStore('loginSessionId', res.result.sessionId);
			this.setStore('loginMobile', this.form.phone);
			this.setStore('loginStep', 'loginSuccess');
			this.$router.push({
				name: 'switchcorp',
			});
		},
		handleResetByMobile() {
			this.$router.push({
				name: 'reset',
			});
		},
	},
	mounted() {
		this.init();
	},
};
</script>

<style lang="less">
@import './login.less';
</style>
